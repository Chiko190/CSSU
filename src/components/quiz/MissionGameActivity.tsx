"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Mission, MissionGameCheck, MissionOption, MissionStep } from "@/core/content/types";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { computeScene, stepIdsOf } from "@/core/content/missionGame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { hashString, seededShuffle } from "@/lib/seededShuffle";
import { starsFor, useGameSession, type GameSession } from "@/components/game/useGameSession";
import { usePracticalProgress } from "@/components/game/usePracticalProgress";
import { NetworkScene, nodeIcon, type ActivePulse } from "@/components/game/NetworkScene";
import {
  DialogueFeedback,
  DialogueHeader,
  GameClearedCard,
  GameFrame,
  ProgressDots,
  StarRow,
} from "@/components/game/GameUi";

type Phase = "briefing" | "playing" | "complete";

/** UC3/UC4's quiz-gating practical check: a story-driven network sim, laid out as one compact game
 * frame so everything fits on screen at once -- a top bar (title, mission dots, timer, combo,
 * mistakes, hearts), the live network map (NetworkScene), and an RPG-style dialogue box under it
 * where the device that's "talking" asks its question and the answers sit right below. The world
 * visibly changes as steps land (roles badge onto the server, clients light up when they join, the
 * folder blows up in the disaster); timed rush rounds and hold-your-nerve wait steps add pressure.
 * Each finished mission is persisted like any other practical-check item, so a reload resumes at
 * the next mission with the map rebuilt from what's already done. */
export function MissionGameActivity({
  moduleId,
  taskId,
  check,
  initialCheckedIds,
  initialHearts,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  check: MissionGameCheck;
  initialCheckedIds: string[];
  initialHearts: PublicHeartsState;
  onComplete: () => void;
}) {
  const game = useGameSession({ initialHearts, bestKey: `nc2:best:${moduleId}:${taskId}`, autoStart: false });
  const { checkedIds, markChecked, persisting, error } = usePracticalProgress({ moduleId, taskId, initialCheckedIds });

  const missionIndex = check.missions.findIndex((m) => !checkedIds.has(m.id));
  const allDone = missionIndex === -1;
  const mission = allDone ? null : check.missions[missionIndex];

  const [phase, setPhase] = useState<Phase>("briefing");
  const [stepIndex, setStepIndex] = useState(0);
  const [justCompleted, setJustCompleted] = useState<{ mission: Mission; stars: 1 | 2 | 3; last: boolean } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastExplain, setLastExplain] = useState<string | null>(null);
  const [partialBadges, setPartialBadges] = useState<string[]>([]);
  const [pulses, setPulses] = useState<ActivePulse[]>([]);
  const missionStartMistakes = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);

  const step = mission && phase === "playing" ? mission.steps[stepIndex] : null;

  // Rebuild the world from finished missions + steps done so far in this one.
  const scene = useMemo(() => {
    const done = new Set(stepIdsOf(check.missions.filter((m) => checkedIds.has(m.id))));
    if (mission) mission.steps.slice(0, phase === "playing" ? stepIndex : 0).forEach((s) => done.add(s.id));
    const state = computeScene(check, done);
    if (step?.kind === "slots" && partialBadges.length > 0) {
      const actor = state.nodes.find((n) => n.id === step.actor);
      if (actor) actor.badges = [...actor.badges, ...partialBadges.filter((b) => !actor.badges.includes(b))];
    }
    return state;
  }, [check, checkedIds, mission, phase, stepIndex, step, partialBadges]);

  const speaker = step ? scene.nodes.find((n) => n.id === step.actor) : undefined;

  // Loop a packet along the wait step's link while it runs.
  const loopPulse: ActivePulse | null =
    step?.kind === "wait" && step.pulse ? { key: -1, link: step.pulse.link, reverse: step.pulse.reverse, loop: true } : null;

  function firePulse(pulse: MissionStep["pulse"]) {
    if (!pulse) return;
    const key = Date.now() + Math.random();
    setPulses((prev) => [...prev, { key, ...pulse }]);
    window.setTimeout(() => setPulses((prev) => prev.filter((p) => p.key !== key)), 1200);
  }

  function startMission() {
    game.start();
    missionStartMistakes.current = game.mistakes;
    setStepIndex(0);
    setLastExplain(null);
    setPhase("playing");
    // Bring the whole frame (map + dialogue) into view so nothing needs scrolling mid-mission.
    frameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function completeStep(fast: boolean) {
    if (!mission || !step) return;
    game.recordCorrect(fast ? "⚡ Lightning fast!" : "Nice!");
    firePulse(step.pulse);
    setLastExplain(step.explain);
    setPartialBadges([]);
    if (stepIndex + 1 < mission.steps.length) {
      setStepIndex(stepIndex + 1);
      return;
    }
    const last = missionIndex === check.missions.length - 1;
    markChecked(mission.id);
    setJustCompleted({ mission, stars: starsFor(game.mistakes - missionStartMistakes.current), last });
    setPhase("complete");
    setStepIndex(0);
    if (last) game.finish();
  }

  if (showResults && game.result) {
    return <GameClearedCard result={game.result} onContinue={onComplete} busy={persisting} />;
  }

  if (allDone && phase !== "complete") {
    // Finished in an earlier visit (e.g. reloaded after the last mission) -- just move on.
    return (
      <Card className="p-6 text-center space-y-3">
        <p className="text-lg font-semibold text-text">Every mission complete!</p>
        <Button onClick={onComplete} disabled={persisting}>
          Start the quiz
        </Button>
      </Card>
    );
  }

  const overlay =
    phase === "complete" && justCompleted ? (
      <MissionCompleteOverlay
        title={justCompleted.mission.title}
        stars={justCompleted.stars}
        last={justCompleted.last}
        onNext={() => (justCompleted.last ? setShowResults(true) : setPhase("briefing"))}
      />
    ) : phase === "briefing" && mission ? (
      <BriefingOverlay
        gameTitle={check.title}
        story={missionIndex === 0 ? check.story : null}
        number={missionIndex + 1}
        total={check.missions.length}
        mission={mission}
        onStart={startMission}
      />
    ) : null;

  return (
    <div ref={frameRef} className="scroll-mt-20">
      <GameFrame
        title={check.title}
        progress={
          <ProgressDots
            labels={check.missions.map((m, i) => `Mission ${i + 1}: ${m.title}`)}
            isDone={(i) => checkedIds.has(check.missions[i].id)}
            activeIndex={missionIndex}
          />
        }
        game={game}
        stage={<NetworkScene scene={scene} speakerId={speaker?.id ?? null} pulses={loopPulse ? [...pulses, loopPulse] : pulses} />}
        overlay={overlay}
      >
        <div className="min-h-[150px]">
          {step && speaker && mission ? (
            <StepPanel
              key={step.id}
              step={step}
              speaker={{ label: speaker.label, icon: nodeIcon(speaker.kind) }}
              missionTitle={mission.title}
              stepIndex={stepIndex}
              stepCount={mission.steps.length}
              lastExplain={lastExplain}
              game={game}
              disabled={game.outOfHearts}
              onChip={(t) => setPartialBadges((p) => [...p, t])}
              onDone={completeStep}
            />
          ) : (
            <p className="text-sm text-text-faint">
              {phase === "complete" ? "Mission complete!" : "Read the briefing, then start the mission."}
            </p>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {persisting && <p className="mt-2 text-xs text-text-faint">Saving…</p>}
        </div>
      </GameFrame>
    </div>
  );
}

function BriefingOverlay({
  gameTitle,
  story,
  number,
  total,
  mission,
  onStart,
}: {
  gameTitle: string;
  story: string | null;
  number: number;
  total: number;
  mission: Mission;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex overflow-y-auto bg-bg/80 backdrop-blur-sm p-4">
      <div className="m-auto max-w-md text-center space-y-4 animate-game-pop">
        {story && (
          <div className="space-y-1.5">
            <p className="font-display text-2xl sm:text-3xl font-bold text-text">🎮 {gameTitle}</p>
            <p className="text-sm text-text-muted">{story}</p>
          </div>
        )}
        <div className="rounded-[var(--radius-lg)] border border-primary/50 bg-surface p-5 text-left shadow-[var(--shadow-glow-primary)]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            Mission {number} of {total} · Briefing
          </p>
          <p className="mt-1 text-xl font-bold text-text">{mission.title}</p>
          <p className="mt-1.5 text-sm text-text-muted">{mission.briefing}</p>
          <p className="mt-3 text-xs text-text-faint">
            {mission.steps.length} steps · wrong moves cost a ❤️ · chain right answers for a 🔥 combo
          </p>
        </div>
        <Button onClick={onStart} size="lg">
          ▶ Start mission
        </Button>
      </div>
    </div>
  );
}

function MissionCompleteOverlay({
  title,
  stars,
  last,
  onNext,
}: {
  title: string;
  stars: 1 | 2 | 3;
  last: boolean;
  onNext: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex overflow-y-auto bg-bg/75 backdrop-blur-sm p-4">
      <div className="m-auto text-center space-y-3 animate-game-pop">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-success">Mission complete</p>
        <p className="font-display text-3xl sm:text-4xl font-bold text-text">{title}</p>
        <StarRow stars={stars} />
        <Button onClick={onNext} size="lg">
          {last ? "🏆 See results" : "Next mission ▶"}
        </Button>
      </div>
    </div>
  );
}

/** The dialogue box: who's talking, their line, and the moves. Keyed by step id, so its local
 * state (wrong picks, placed chips, trap used) resets for every new step. */
function StepPanel({
  step,
  speaker,
  missionTitle,
  stepIndex,
  stepCount,
  lastExplain,
  game,
  disabled,
  onChip,
  onDone,
}: {
  step: MissionStep;
  speaker: { label: string; icon: string };
  missionTitle: string;
  stepIndex: number;
  stepCount: number;
  lastExplain: string | null;
  game: GameSession;
  disabled: boolean;
  onChip: (text: string) => void;
  onDone: (fast: boolean) => void;
}) {
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const timeLeftRef = useRef(1);

  const options = useMemo(
    () => (step.kind === "wait" ? [] : seededShuffle<MissionOption>(step.kind === "choice" ? step.options : step.chips, hashString(step.id))),
    [step],
  );

  function miss(option: MissionOption) {
    setWrongIds((prev) => new Set(prev).add(option.id));
    setFeedback(option.why ?? "Not that one.");
    setShakeKey((k) => k + 1);
    void game.recordMistake("Wrong move -- you lost a heart.");
  }

  function pickChoice(option: MissionOption) {
    if (disabled) return;
    if (option.correct) onDone(timeLeftRef.current > 0.6 && step.kind === "choice" && Boolean(step.timerSec));
    else miss(option);
  }

  function pickChip(option: MissionOption) {
    if (disabled || step.kind !== "slots") return;
    if (!option.correct) {
      miss(option);
      return;
    }
    const next = new Set(placedIds).add(option.id);
    setPlacedIds(next);
    setFeedback(null);
    onChip(option.text);
    if (step.chips.filter((c) => c.correct).every((c) => next.has(c.id))) onDone(false);
  }

  return (
    <div className="space-y-3">
      <DialogueHeader icon={speaker.icon} speaker={speaker.label} meta={`${missionTitle} · step ${stepIndex + 1}/${stepCount}`} line={step.prompt} />

      {step.kind === "choice" && step.timerSec && (
        <TimerBar seconds={step.timerSec} paused={disabled} timeLeftRef={timeLeftRef} onExpire={() => game.breakCombo("⏱ Too slow -- combo lost!")} />
      )}

      {step.kind === "choice" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((option, i) => {
            const wrong = wrongIds.has(option.id);
            return (
              <button
                key={wrong ? `${option.id}-x-${shakeKey}` : option.id}
                type="button"
                onClick={() => pickChoice(option)}
                disabled={disabled || wrong}
                className={`group flex items-center gap-2.5 text-left px-3 py-2.5 rounded-[var(--radius-md)] border text-sm transition-all ${
                  wrong
                    ? "animate-game-shake border-danger/40 bg-danger/5 text-text-faint line-through cursor-not-allowed"
                    : "border-border bg-bg-elevated text-text hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/10 hover:shadow-[var(--shadow-glow-primary)] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                    wrong ? "bg-danger/20 text-danger" : "bg-surface-2 text-text-muted group-hover:bg-primary group-hover:text-[#04141c]"
                  }`}
                >
                  {wrong ? "✖" : String.fromCharCode(65 + i)}
                </span>
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {step.kind === "slots" && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-primary/50 bg-primary/5 px-3 py-2">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-primary">{step.bayLabel}</span>
            {step.chips
              .filter((c) => c.correct)
              .map((c, i) => {
                const placed = placedIds.has(c.id);
                return (
                  <span
                    key={c.id}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      placed ? "animate-game-pop border-success bg-success/15 text-success" : "border-dashed border-border text-text-faint"
                    }`}
                  >
                    {placed ? c.text : `slot ${i + 1}`}
                  </span>
                );
              })}
          </div>
          <div className="flex flex-wrap gap-2">
            {options
              .filter((o) => !placedIds.has(o.id))
              .map((option) => {
                const wrong = wrongIds.has(option.id);
                return (
                  <button
                    key={wrong ? `${option.id}-x-${shakeKey}` : option.id}
                    type="button"
                    onClick={() => pickChip(option)}
                    disabled={disabled || wrong}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ${
                      wrong
                        ? "animate-game-shake border-danger/40 text-text-faint line-through cursor-not-allowed"
                        : "border-accent/60 bg-accent/10 text-text hover:-translate-y-0.5 hover:bg-accent/25 cursor-pointer disabled:cursor-not-allowed"
                    }`}
                  >
                    {wrong ? "✖ " : "+ "}
                    {option.text}
                  </button>
                );
              })}
          </div>
          <p className="text-[11px] text-text-faint">Tap a module to slot it in -- decoys cost a heart.</p>
        </div>
      )}

      {step.kind === "wait" && (
        <WaitPanel
          seconds={step.seconds}
          progressText={step.progressText}
          trap={step.trap}
          paused={disabled}
          onTrap={() => {
            setFeedback(step.trap.why);
            void game.recordMistake("It's a trap! You lost a heart.");
          }}
          onDone={() => onDone(false)}
        />
      )}

      <DialogueFeedback wrong={feedback} lastExplain={lastExplain} shakeKey={shakeKey} />
    </div>
  );
}

/** Countdown bar for a timed rush round. Running out breaks the combo (no heart) and restarts. */
function TimerBar({
  seconds,
  paused,
  timeLeftRef,
  onExpire,
}: {
  seconds: number;
  paused: boolean;
  timeLeftRef: RefObject<number>;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(1);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (paused) return;
    let deadline = Date.now() + seconds * 1000;
    const id = window.setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        onExpireRef.current();
        deadline = Date.now() + seconds * 1000;
        timeLeftRef.current = 1;
        setLeft(1);
        return;
      }
      timeLeftRef.current = remaining / (seconds * 1000);
      setLeft(timeLeftRef.current);
    }, 100);
    return () => window.clearInterval(id);
  }, [seconds, paused, timeLeftRef]);

  const urgent = left < 0.3;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-14 text-xs font-mono-tabular font-semibold ${urgent ? "text-danger animate-pulse" : "text-warning"}`}>
        ⏱ {Math.ceil(left * seconds)}s
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ${urgent ? "bg-danger" : left < 0.6 ? "bg-warning" : "bg-success"}`}
          style={{ width: `${left * 100}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-warning">Rush!</span>
    </div>
  );
}

/** A progress bar that completes on its own -- while a tempting trap button blinks. */
function WaitPanel({
  seconds,
  progressText,
  trap,
  paused,
  onTrap,
  onDone,
}: {
  seconds: number;
  progressText: string;
  trap: { text: string };
  paused: boolean;
  onTrap: () => void;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [trapUsed, setTrapUsed] = useState(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (paused) return;
    const tickMs = 100;
    const id = window.setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + tickMs / (seconds * 1000));
      setProgress(progressRef.current);
      if (progressRef.current >= 1 && !doneRef.current) {
        doneRef.current = true;
        window.clearInterval(id);
        onDoneRef.current();
      }
    }, tickMs);
    return () => window.clearInterval(id);
  }, [seconds, paused]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3">
      <div>
        <div className="mb-1 flex justify-between text-xs text-text-muted">
          <span>{progressText}…</span>
          <span className="font-mono-tabular">{Math.floor(progress * 100)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-text-faint">Hold your nerve -- let it finish.</p>
      </div>
      {!trapUsed && (
        <button
          type="button"
          onClick={() => {
            if (paused) return;
            setTrapUsed(true);
            onTrap();
          }}
          className="animate-game-blink rounded-[var(--radius-md)] border border-danger/60 bg-danger/15 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/25 cursor-pointer"
        >
          {trap.text}
        </button>
      )}
    </div>
  );
}
