"use client";

import { useMemo, useState } from "react";
import type { MiniGameStage, MiniGamesCheck, MatchPair, SequenceStep } from "@/core/content/types";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { stageItemIds } from "@/core/content/miniGames";
import { Button } from "@/components/ui/Button";
import { hashString, seededShuffle } from "@/lib/seededShuffle";
import { useGameSession, type GameSession } from "@/components/game/useGameSession";
import { usePracticalProgress } from "@/components/game/usePracticalProgress";
import { DialogueFeedback, DialogueHeader, GameClearedCard, GameFrame, ProgressDots } from "@/components/game/GameUi";

/** Quiz-gating practical check for UC1/UC2's software tasks -- a short run of mini-game stages
 * ("Sequence Sprint": tap the job-sheet steps in order while dodging trap cards; "Match-Up": pair
 * each clue with its answer) in the shared GameFrame. Every correct step/pair is persisted like the
 * 3D checks' steps, so a reload resumes at the same stage; mistakes and trap cards cost a heart. */
export function MiniGamesCheckActivity({
  moduleId,
  taskId,
  check,
  initialCheckedIds,
  initialHearts,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  check: MiniGamesCheck;
  initialCheckedIds: string[];
  initialHearts: PublicHeartsState;
  onComplete: () => void;
}) {
  const game = useGameSession({ initialHearts, bestKey: `nc2:best:${moduleId}:${taskId}` });
  const { checkedIds, markChecked, persisting, error } = usePracticalProgress({ moduleId, taskId, initialCheckedIds });

  const stageIndex = check.stages.findIndex((stage) => stageItemIds(stage).some((id) => !checkedIds.has(id)));
  const allDone = stageIndex === -1;
  const stage = allDone ? null : check.stages[stageIndex];
  const doneCount = check.items.filter((item) => checkedIds.has(item.id)).length;

  function complete(itemId: string, label: string) {
    markChecked(itemId);
    game.recordCorrect(label);
    // Match pairs can be done in any order, so "last" means the count, not a particular id.
    if (doneCount + 1 === check.items.length) game.finish();
  }

  if (allDone && game.result) {
    return <GameClearedCard result={game.result} onContinue={onComplete} busy={persisting} />;
  }

  return (
    <GameFrame
      title={stage ? stage.title.replace(/^[^:]+:\s*/, "") : "All stages complete"}
      progress={
        <ProgressDots
          labels={check.stages.map((s) => s.title)}
          isDone={(i) => stageItemIds(check.stages[i]).every((id) => checkedIds.has(id))}
          activeIndex={stageIndex}
        />
      }
      game={game}
    >
      {stage?.kind === "sequence" && (
        <SequenceStage
          key={stage.id}
          stage={stage}
          stageNumber={stageIndex + 1}
          stageCount={check.stages.length}
          checkedIds={checkedIds}
          game={game}
          onCorrect={(step) => complete(step.id, "Correct step")}
        />
      )}
      {stage?.kind === "match" && (
        <MatchStage
          key={stage.id}
          stage={stage}
          stageNumber={stageIndex + 1}
          stageCount={check.stages.length}
          checkedIds={checkedIds}
          game={game}
          onCorrect={(pair) => complete(pair.id, "Matched")}
        />
      )}
      {allDone && !game.result && (
        // Already finished in an earlier visit (e.g. reload after clearing) -- just move on.
        <div className="space-y-3 py-4 text-center">
          <p className="text-lg font-semibold text-text">Every stage is done!</p>
          <Button onClick={onComplete} disabled={persisting}>
            Start the quiz
          </Button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {persisting && <p className="mt-2 text-xs text-text-faint">Saving…</p>}
    </GameFrame>
  );
}

const CARD_BUTTON =
  "group flex items-center gap-2.5 text-left px-3 py-2.5 rounded-[var(--radius-md)] border text-sm transition-all";
const CARD_IDLE =
  "border-border bg-bg-elevated text-text hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/10 hover:shadow-[var(--shadow-glow-primary)] cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0";

type SequenceCard = { kind: "step"; step: SequenceStep } | { kind: "trap"; id: string; label: string; why: string };

function SequenceStage({
  stage,
  stageNumber,
  stageCount,
  checkedIds,
  game,
  onCorrect,
}: {
  stage: Extract<MiniGameStage, { kind: "sequence" }>;
  stageNumber: number;
  stageCount: number;
  checkedIds: Set<string>;
  game: GameSession;
  onCorrect: (step: SequenceStep) => void;
}) {
  const [sprungIds, setSprungIds] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ id: string; text: string; n: number } | null>(null);

  // Seeded by the stage id so SSR and the client agree on the shuffled deck.
  const deck = useMemo<SequenceCard[]>(
    () =>
      seededShuffle<SequenceCard>(
        [...stage.steps.map((step) => ({ kind: "step" as const, step })), ...stage.traps.map((t) => ({ kind: "trap" as const, ...t }))],
        hashString(stage.id),
      ),
    [stage],
  );

  const placed = stage.steps.filter((s) => checkedIds.has(s.id));
  const nextStep = stage.steps.find((s) => !checkedIds.has(s.id));
  const remaining = deck.filter((card) => (card.kind === "step" ? !checkedIds.has(card.step.id) : !sprungIds.has(card.id)));
  const lastPlaced = placed[placed.length - 1];

  function tap(card: SequenceCard) {
    if (game.outOfHearts) return;
    if (card.kind === "trap") {
      setSprungIds((prev) => new Set(prev).add(card.id));
      setWrong((prev) => ({ id: card.id, text: `Trap card! "${card.label}" -- ${card.why}`, n: (prev?.n ?? 0) + 1 }));
      void game.recordMistake("Trap card! You lost a heart.");
      return;
    }
    if (card.step.id === nextStep?.id) {
      setWrong(null);
      onCorrect(card.step);
      return;
    }
    setWrong((prev) => ({ id: card.step.id, text: "Not yet -- that step comes later in the procedure.", n: (prev?.n ?? 0) + 1 }));
    void game.recordMistake("Not yet -- you lost a heart.");
  }

  return (
    <div className="space-y-4">
      <DialogueHeader
        icon="🃏"
        speaker="Sequence Sprint"
        meta={`stage ${stageNumber}/${stageCount} · step ${placed.length + 1} of ${stage.steps.length}`}
        line={nextStep ? <>Which step comes {placed.length === 0 ? "first" : "next"}?</> : "Procedure complete!"}
      />
      <p className="-mt-2 pl-14 text-xs text-text-muted">{stage.instructions}</p>

      {/* The procedure being built: placed steps, then one glowing "?" slot for the next. */}
      <ol className="space-y-1.5 rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated p-3" aria-label="Your procedure">
        {placed.map((step, i) => (
          <li key={step.id} className="flex items-start gap-2.5 animate-game-pop">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-bold text-[#03140d]">
              {i + 1}
            </span>
            <span className="min-w-0 text-sm">
              <span className="font-semibold text-success">{step.label}</span>
              {step.id === lastPlaced?.id && <span className="block text-xs text-text-muted">{step.explanation}</span>}
            </span>
          </li>
        ))}
        {nextStep && (
          <li className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 animate-pulse items-center justify-center rounded-full border border-primary text-[10px] font-bold text-primary">
              {placed.length + 1}
            </span>
            <span className="text-sm text-text-faint">? -- tap the right card below</span>
          </li>
        )}
      </ol>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {remaining.map((card) => {
          const id = card.kind === "step" ? card.step.id : card.id;
          const label = card.kind === "step" ? card.step.label : card.label;
          const shaking = wrong?.id === id;
          return (
            <button
              key={shaking ? `${id}-${wrong.n}` : id}
              type="button"
              onClick={() => tap(card)}
              disabled={game.outOfHearts}
              className={`${CARD_BUTTON} ${shaking ? "animate-game-shake border-danger/60 bg-danger/5 text-text" : CARD_IDLE}`}
            >
              <span className="text-base" aria-hidden>
                🂠
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <DialogueFeedback wrong={wrong?.text ?? null} lastExplain={null} shakeKey={wrong?.n} />
    </div>
  );
}

function MatchStage({
  stage,
  stageNumber,
  stageCount,
  checkedIds,
  game,
  onCorrect,
}: {
  stage: Extract<MiniGameStage, { kind: "match" }>;
  stageNumber: number;
  stageCount: number;
  checkedIds: Set<string>;
  game: GameSession;
  onCorrect: (pair: MatchPair) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ answer: string; text: string; n: number } | null>(null);
  const [lastExplain, setLastExplain] = useState<string | null>(null);

  const clues = useMemo(() => seededShuffle(stage.pairs, hashString(`${stage.id}:clues`)), [stage]);
  const answers = useMemo(
    () => seededShuffle(Array.from(new Set(stage.pairs.map((p) => p.answer))), hashString(`${stage.id}:answers`)),
    [stage],
  );
  const selected = clues.find((p) => p.id === selectedId && !checkedIds.has(p.id)) ?? null;
  const matchedCount = stage.pairs.filter((p) => checkedIds.has(p.id)).length;

  function pickAnswer(answer: string) {
    if (game.outOfHearts || !selected) return;
    if (selected.answer === answer) {
      onCorrect(selected);
      setLastExplain(`${selected.answer} -- ${selected.explanation}`);
      setWrong(null);
      setSelectedId(null);
      return;
    }
    setWrong((prev) => ({ answer, text: `"${answer}" doesn't match that clue.`, n: (prev?.n ?? 0) + 1 }));
    void game.recordMistake(`"${answer}" isn't it.`);
  }

  return (
    <div className="space-y-4">
      <DialogueHeader
        icon="🧩"
        speaker="Match-Up"
        meta={`stage ${stageNumber}/${stageCount} · ${matchedCount} of ${stage.pairs.length} matched`}
        line={
          selected ? (
            <>
              Now tap the answer for: <span className="text-primary">&ldquo;{selected.prompt}&rdquo;</span>
            </>
          ) : (
            "Pick a clue, then tap its answer."
          )
        }
      />

      {/* Answer chips stay put on top so the clue you just picked and its answer are both in view. */}
      <div className="flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-dashed border-accent/50 bg-accent/5 p-3">
        {answers.map((answer) => {
          const shaking = wrong?.answer === answer;
          return (
            <button
              key={shaking ? `${answer}-${wrong.n}` : answer}
              type="button"
              onClick={() => pickAnswer(answer)}
              disabled={!selected || game.outOfHearts}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ${
                shaking ? "animate-game-shake border-danger text-danger" : ""
              } ${
                selected
                  ? "border-accent/70 bg-accent/15 text-text hover:-translate-y-0.5 hover:bg-accent/30 cursor-pointer"
                  : "border-border bg-surface-2 text-text-faint cursor-not-allowed"
              }`}
            >
              {answer}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {clues.map((pair) => {
          const done = checkedIds.has(pair.id);
          const isSelected = selected?.id === pair.id;
          return (
            <li key={pair.id}>
              <button
                type="button"
                onClick={() => !done && setSelectedId(pair.id)}
                disabled={done || game.outOfHearts}
                aria-pressed={isSelected}
                className={`${CARD_BUTTON} h-full w-full items-start ${
                  done
                    ? "animate-game-pop border-success/40 bg-success/10 cursor-default"
                    : isSelected
                      ? "border-primary bg-primary/15 shadow-[var(--shadow-glow-primary)] cursor-pointer"
                      : CARD_IDLE
                }`}
              >
                <span className="text-base" aria-hidden>
                  {done ? "✅" : isSelected ? "👉" : "❔"}
                </span>
                <span className="min-w-0">
                  <span className={`block ${done ? "text-text-muted" : "text-text"}`}>{pair.prompt}</span>
                  {done && <span className="mt-0.5 block text-xs font-semibold text-success">{pair.answer}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <DialogueFeedback wrong={wrong?.text ?? null} lastExplain={lastExplain} shakeKey={wrong?.n} />
    </div>
  );
}
