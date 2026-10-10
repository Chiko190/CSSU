"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { useHeartsRefill } from "./useHeartsRefill";

export interface GameToast {
  /** Bumped on every toast so the same text re-triggers its animation. */
  key: number;
  text: string;
  tone: "good" | "bad";
}

export interface GameResult {
  elapsedMs: number;
  mistakes: number;
  bestCombo: number;
  stars: 1 | 2 | 3;
  /** Previous best time for this check on this device, or null if this is the first clear. */
  previousBestMs: number | null;
  isNewBest: boolean;
}

/** 3 stars for a clean run, 2 for one or two slips, 1 for anything else -- shown on the cleared
 * screen. Purely cosmetic: progress and XP don't depend on it. */
export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function readBest(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeBest(key: string, ms: number) {
  try {
    window.localStorage.setItem(key, String(ms));
  } catch {
    // Best time is a per-device nicety -- private mode or blocked storage just skips it.
  }
}

/** Shared game state for every quiz-gating practical check (3D assembly, wire order, and the
 * UC3/UC4 mission games): a running timer, combo streak, mistake count, and the learner's real
 * hearts. A mistake spends a heart through /api/hearts/lose exactly like a wrong quiz answer, and
 * at 0 hearts `outOfHearts` locks play until one regenerates -- previously a learner could keep
 * mis-clicking for free once they hit 0. */
export function useGameSession({
  initialHearts,
  bestKey,
  autoStart = true,
}: {
  initialHearts: PublicHeartsState;
  /** localStorage key for this check's best clear time. */
  bestKey: string;
  /** False to hold the clock at 0:00 until start() -- for games that open on a briefing. */
  autoStart?: boolean;
}) {
  const router = useRouter();
  const [hearts, setHearts] = useState(initialHearts);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [toast, setToast] = useState<GameToast | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  // Both start at the same instant, so SSR and the first client render each show 0:00 -- no
  // hydration mismatch even though the two clocks differ. With autoStart off (games that open on a
  // briefing screen) the clock stays at 0:00 until start() is called.
  const [startedAt, setStartedAt] = useState<number | null>(() => (autoStart ? Date.now() : null));
  const [now, setNow] = useState(() => startedAt ?? 0);

  const finished = result !== null;
  const running = startedAt !== null && !finished;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  /** Starts the clock (no-op once running). */
  const start = useCallback(() => {
    if (startedAt !== null) return;
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
  }, [startedAt]);

  const elapsedMs = result ? result.elapsedMs : startedAt === null ? 0 : Math.max(0, now - startedAt);

  const outOfHearts = hearts.current <= 0;

  const refreshHearts = useCallback(async () => {
    try {
      setHearts(await apiFetch<PublicHeartsState>("/api/hearts"));
    } catch {
      // Best-effort -- the next poll or interaction will try again.
    }
  }, []);

  // Picks up each regenerated heart as it lands, so play resumes on its own after a lockout.
  useHeartsRefill(hearts, refreshHearts);

  const showToast = useCallback((text: string, tone: GameToast["tone"]) => {
    setToast({ key: Date.now() + Math.random(), text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Counters live in refs (mirrored into state for rendering) so recordCorrect() followed by
  // finish() in the same handler -- the last step of every check -- sees the final numbers rather
  // than a stale render's.
  const countersRef = useRef({ mistakes: 0, combo: 0, bestCombo: 0 });

  const recordCorrect = useCallback(
    (label?: string) => {
      const c = countersRef.current;
      c.combo += 1;
      c.bestCombo = Math.max(c.bestCombo, c.combo);
      setCombo(c.combo);
      setBestCombo(c.bestCombo);
      if (c.combo >= 3) showToast(`🔥 Combo x${c.combo}!`, "good");
      else if (label) showToast(`✓ ${label}`, "good");
    },
    [showToast],
  );

  const recordMistake = useCallback(
    async (message: string) => {
      const c = countersRef.current;
      c.combo = 0;
      c.mistakes += 1;
      setCombo(0);
      setMistakes(c.mistakes);
      try {
        const res = await apiFetch<{ ok: boolean; hearts: PublicHeartsState }>("/api/hearts/lose", { method: "POST" });
        setHearts(res.hearts);
        showToast(res.ok ? `💔 ${message}` : "You're out of hearts -- wait for one to refill.", "bad");
        // The header's heart count is server-rendered.
        router.refresh();
      } catch {
        showToast(message, "bad");
      }
    },
    [router, showToast],
  );

  /** Loses the combo without spending a heart -- e.g. a timed round running out. */
  const breakCombo = useCallback(
    (message: string) => {
      countersRef.current.combo = 0;
      setCombo(0);
      showToast(message, "bad");
    },
    [showToast],
  );

  const finish = useCallback(() => {
    if (result) return;
    const elapsed = startedAt === null ? 0 : Date.now() - startedAt;
    const previousBestMs = readBest(bestKey);
    const isNewBest = previousBestMs === null || elapsed < previousBestMs;
    if (isNewBest) writeBest(bestKey, elapsed);
    const { mistakes: finalMistakes, bestCombo: finalBestCombo } = countersRef.current;
    setResult({
      elapsedMs: elapsed,
      mistakes: finalMistakes,
      bestCombo: finalBestCombo,
      stars: starsFor(finalMistakes),
      previousBestMs,
      isNewBest,
    });
  }, [bestKey, result, startedAt]);

  return {
    hearts,
    outOfHearts,
    mistakes,
    combo,
    bestCombo,
    elapsedMs,
    toast,
    result,
    recordCorrect,
    recordMistake,
    breakCombo,
    start,
    finish,
  };
}

export type GameSession = ReturnType<typeof useGameSession>;
