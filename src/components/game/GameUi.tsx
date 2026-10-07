"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconTrophy } from "@/components/ui/Icon";
import { hashString, seededShuffle } from "@/lib/seededShuffle";
import { formatElapsed, type GameResult, type GameSession, type GameToast } from "./useGameSession";

/** One row across the top of every game frame: title, progress, timer, combo, mistakes, hearts. */
export function GameTopBar({ title, progress, game }: { title: string; progress: ReactNode; game: GameSession }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
      <p className="font-display text-sm font-bold text-text">🎮 {title}</p>
      {progress}
      <div className="ml-auto flex items-center gap-3 text-xs font-semibold font-mono-tabular">
        <span className="text-text-muted" aria-label="Time">
          ⏱ {formatElapsed(game.elapsedMs)}
        </span>
        <span
          key={game.combo}
          aria-label="Combo"
          className={game.combo >= 3 ? "text-xp animate-game-pop" : game.combo > 0 ? "text-text animate-game-pop" : "text-text-faint"}
        >
          🔥 x{game.combo}
        </span>
        <span aria-label="Mistakes" className={game.mistakes > 0 ? "text-danger" : "text-text-faint"}>
          ✖ {game.mistakes}
        </span>
        <span className="flex" aria-label={`${game.hearts.current} of ${game.hearts.max} hearts`}>
          {Array.from({ length: game.hearts.max }, (_, i) => (
            <span key={i} className={i < game.hearts.current ? "" : "opacity-20 grayscale"}>
              ❤️
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/** Numbered progress dots (✓ done, glowing current) -- for checks with a handful of stages. */
export function ProgressDots({ labels, isDone, activeIndex }: { labels: string[]; isDone: (i: number) => boolean; activeIndex: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-1" aria-label="Progress">
      {labels.map((label, i) => {
        const done = isDone(i);
        const active = i === activeIndex;
        return (
          <li
            key={`${i}-${label}`}
            title={label}
            aria-label={`${label}${done ? " (done)" : active ? " (current)" : ""}`}
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              done
                ? "bg-success text-[#03140d]"
                : active
                  ? "bg-primary text-[#04141c] shadow-[var(--shadow-glow-primary)]"
                  : "bg-surface-2 text-text-faint"
            }`}
          >
            {done ? "✓" : i + 1}
          </li>
        );
      })}
    </ol>
  );
}

/** Thin segmented bar + "n/total" -- for long step sequences where dots would wrap. */
export function ProgressSegments({ total, done, label }: { total: number; done: number; label?: string }) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center gap-2" aria-label={`${done} of ${total} done`}>
      <div className="flex h-1.5 flex-1 gap-px overflow-hidden rounded-full">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`flex-1 ${i < done ? "bg-success" : i === done ? "bg-primary" : "bg-surface-2"}`} />
        ))}
      </div>
      <span className="shrink-0 text-[11px] font-semibold font-mono-tabular text-text-muted">{label ?? `${done}/${total}`}</span>
    </div>
  );
}

/** The shared layout for every quiz-gating game: top bar, an optional full-width play area (a 3D
 * scene or the network map), and a dialogue box below for the current step -- all in one card so
 * it fits on screen in the page's narrow column. The out-of-hearts lock covers the whole frame. */
export function GameFrame({
  title,
  progress,
  game,
  stage,
  overlay,
  children,
}: {
  title: string;
  progress: ReactNode;
  game: GameSession;
  stage?: ReactNode;
  /** Briefing / mission-complete style screens drawn over the whole frame. */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden p-0">
      <GameTopBar title={title} progress={progress} game={game} />
      <div className="relative border-t border-border-soft">
        {stage && <div className="relative border-b border-border-soft bg-bg-elevated">{stage}</div>}
        <GameToastBubble toast={game.toast} />
        <div className="p-4 sm:p-5">{children}</div>
      </div>
      {overlay}
      <OutOfHeartsOverlay game={game} />
    </Card>
  );
}

/** "Who's talking + what they're asking" header of the dialogue box. */
export function DialogueHeader({ icon, speaker, meta, line }: { icon: string; speaker: string; meta?: string; line: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-primary/50 bg-primary/10 text-2xl shadow-[var(--shadow-glow-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className="text-primary">{speaker}</span>
          {meta && <span className="text-text-faint">{meta}</span>}
        </p>
        <div className="mt-0.5 text-base font-semibold text-text animate-game-pop">{line}</div>
      </div>
    </div>
  );
}

/** The red "Nope: …" line after a mistake, otherwise the green "Last step: …" learning line. */
export function DialogueFeedback({ wrong, lastExplain, shakeKey }: { wrong: string | null; lastExplain: string | null; shakeKey?: number }) {
  if (wrong) {
    return (
      <p key={shakeKey} className="animate-game-pop rounded-[var(--radius-md)] border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-text-muted">
        <span className="font-semibold text-danger">✖ Nope: </span>
        {wrong}
      </p>
    );
  }
  if (!lastExplain) return null;
  return (
    <p className="text-xs text-text-faint">
      <span className="font-semibold text-success">✓ Last step: </span>
      {lastExplain}
    </p>
  );
}

/** Floating "+combo" / "lost a heart" bubble, anchored inside a relative container. */
export function GameToastBubble({ toast }: { toast: GameToast | null }) {
  if (!toast) return null;
  return (
    <div
      key={toast.key}
      role="status"
      className={`pointer-events-none absolute left-1/2 top-4 z-20 animate-game-float-up whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg ${
        toast.tone === "good" ? "bg-success text-[#03140d]" : "bg-danger text-[#2b0410]"
      }`}
    >
      {toast.text}
    </div>
  );
}

/** Blocks the play area while hearts are at 0, with a live refill countdown. */
export function OutOfHeartsOverlay({ game }: { game: GameSession }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!game.outOfHearts) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [game.outOfHearts]);

  if (!game.outOfHearts) return null;
  const refillAt = game.hearts.nextRefillAt;
  const remaining = refillAt ? Math.max(0, refillAt - now) : null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="text-center space-y-1">
        <p className="text-3xl">💔</p>
        <p className="text-base font-semibold text-danger">Out of hearts</p>
        <p className="text-sm text-text-muted">
          {remaining !== null ? (
            <>
              Next heart in <span className="font-mono-tabular" suppressHydrationWarning>{formatElapsed(remaining + 999)}</span>
            </>
          ) : (
            "Wait for a heart to refill."
          )}
        </p>
        <p className="text-xs text-text-faint">Your progress is saved -- you will pick up right here.</p>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ["#4fd1ff", "#a78bfa", "#34d399", "#facc15", "#fb7185"];

/** Lightweight CSS confetti burst -- no canvas, no dependency. Seeded so it's stable per render. */
export function Confetti({ seed = "confetti", count = 48 }: { seed?: string; count?: number }) {
  const pieces = useMemo(() => {
    const rand = seededShuffle(
      Array.from({ length: 200 }, (_, i) => i / 200),
      hashString(seed),
    );
    return Array.from({ length: count }, (_, i) => ({
      left: rand[i] * 100,
      delay: rand[(i + 50) % 200] * 0.6,
      duration: 1.8 + rand[(i + 100) % 200] * 1.4,
      drift: (rand[(i + 150) % 200] - 0.5) * 160,
      spin: 360 + rand[(i + 25) % 200] * 540,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      wide: i % 3 === 0,
    }));
  }, [seed, count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-[2px]"
          style={
            {
              left: `${p.left}%`,
              width: p.wide ? 10 : 6,
              height: p.wide ? 6 : 10,
              background: p.color,
              animation: `game-confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function StarRow({ stars, size = "text-4xl" }: { stars: 1 | 2 | 3; size?: string }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`${size} animate-game-star-in ${n <= stars ? "" : "opacity-20 grayscale"}`}
          style={{ animationDelay: `${n * 0.15}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

/** Shown once every step of a practical check is done -- the learner's reward beat before the
 * quiz questions take over. */
export function GameClearedCard({
  result,
  onContinue,
  continueLabel = "Start the quiz",
  busy = false,
}: {
  result: GameResult;
  onContinue: () => void;
  continueLabel?: string;
  /** True while the final step is still saving -- continuing early would reload into an unfinished check. */
  busy?: boolean;
}) {
  const verdict = result.stars === 3 ? "Flawless!" : result.stars === 2 ? "Great job!" : "Cleared!";
  return (
    <>
      <Confetti seed={`cleared-${result.elapsedMs}`} />
      <Card className="relative p-6 sm:p-8 text-center space-y-4 border-success/40 animate-game-pop">
        <IconTrophy className="h-12 w-12 mx-auto text-xp" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-success">Practical check cleared</p>
          <h2 className="font-display text-3xl font-bold text-text mt-1">{verdict}</h2>
        </div>
        <StarRow stars={result.stars} />
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <ResultStat label="Time" value={formatElapsed(result.elapsedMs)} />
          <ResultStat label="Mistakes" value={String(result.mistakes)} />
          <ResultStat label="Best combo" value={`x${result.bestCombo}`} />
        </div>
        {result.isNewBest ? (
          <p className="text-sm font-semibold text-xp">
            {result.previousBestMs === null ? "🏁 First clear -- time to beat set!" : "🏆 New best time!"}
          </p>
        ) : (
          result.previousBestMs !== null && (
            <p className="text-xs text-text-faint">Your best: {formatElapsed(result.previousBestMs)}</p>
          )
        )}
        <Button onClick={onContinue} disabled={busy}>
          {busy ? "Saving…" : continueLabel}
        </Button>
      </Card>
    </>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-text-faint">{label}</p>
      <p className="font-mono-tabular text-lg font-semibold text-text">{value}</p>
    </div>
  );
}
