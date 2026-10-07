"use client";

import { useState } from "react";
import type { PublicQuizQuestion } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PASS_THRESHOLD } from "@/core/progress/constants";
import { Confetti, StarRow } from "@/components/game/GameUi";
import type { QuizSubmitResponse } from "./types";

/** 3 stars for a perfect run, 2 for a comfortable pass, 1 for a scrape -- cosmetic only. */
function quizStars(scorePct: number): 1 | 2 | 3 {
  if (scorePct === 100) return 3;
  if (scorePct >= 85) return 2;
  return 1;
}

/** Circular score gauge with a tick at the passing line. */
function ScoreRing({ pct, passed }: { pct: number; passed: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const passAngle = (PASS_THRESHOLD / 100) * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-surface-2" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className={`${passed ? "stroke-success" : "stroke-danger"} transition-[stroke-dasharray] duration-700`}
        />
      </svg>
      {/* passing-line tick, drawn unrotated so the math reads naturally */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <line
          x1={60 + Math.cos(passAngle) * 44}
          y1={60 + Math.sin(passAngle) * 44}
          x2={60 + Math.cos(passAngle) * 60}
          y2={60 + Math.sin(passAngle) * 60}
          strokeWidth="2"
          className="stroke-text-muted"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-4xl font-bold ${passed ? "text-success" : "text-danger"}`}>{pct}%</span>
        <span className="text-[10px] uppercase tracking-wide text-text-faint">pass {PASS_THRESHOLD}%</span>
      </div>
    </div>
  );
}

export function ScoreSummary({
  questions,
  firstTryCorrect,
  result,
  bestStreak = 0,
  onRetry,
  onContinue,
}: {
  questions: PublicQuizQuestion[];
  /** Whether each question (by id) was answered correctly on the very first try this attempt --
   * every question ends up "correct" by the time you reach this screen (you have to get each one
   * right to move on), so this is what actually distinguishes a clean run from one with retries. */
  firstTryCorrect: Record<string, boolean>;
  result: QuizSubmitResponse;
  /** Longest run of consecutive correct answers this attempt. */
  bestStreak?: number;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const totalXp = result.xpAwarded.reduce((sum, e) => sum + e.amount, 0);
  const firstTryCount = questions.filter((q) => firstTryCorrect[q.id] ?? true).length;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = questions.find((q) => q.id === openId) ?? null;

  return (
    <>
      {result.passed && <Confetti seed={`quiz-${result.scorePct}`} count={result.perfect ? 80 : 48} />}
      <Card className={`relative overflow-hidden p-0 animate-game-pop ${result.passed ? "border-success/40" : "border-danger/40"}`}>
        <div className="flex items-center gap-2 px-4 py-2.5">
          <p className="font-display text-sm font-bold text-text">🧠 Knowledge Check · Results</p>
        </div>

        <div className="border-t border-border-soft p-6 sm:p-8 text-center space-y-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${result.passed ? "text-success" : "text-danger"}`}>
            {result.perfect ? "Perfect run" : result.passed ? "Quiz passed" : "Not passed yet"}
          </p>
          <ScoreRing pct={result.scorePct} passed={result.passed} />
          {result.passed && <StarRow stars={quizStars(result.scorePct)} size="text-3xl" />}
          <p className="text-sm font-semibold text-text">
            {result.perfect
              ? "Every question right on the first try!"
              : result.passed
                ? "Nice work -- you passed!"
                : "Too many questions needed a retry. Give it another go!"}
          </p>

          <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
            <Stat label="First try" value={`${firstTryCount}/${questions.length}`} />
            <Stat label="Best streak" value={`🔥 ${bestStreak}`} />
            <Stat label="XP" value={totalXp > 0 ? `+${totalXp}` : "--"} highlight={totalXp > 0} />
          </div>
        </div>

        <div className="border-t border-border-soft p-4 sm:p-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
            Question review -- tap a tile to see the question
          </p>
          <ol className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
            {questions.map((q, i) => {
              const firstTry = firstTryCorrect[q.id] ?? true;
              const selected = q.id === openId;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(selected ? null : q.id)}
                    aria-label={`Question ${i + 1}: ${firstTry ? "right first try" : "needed a retry"}`}
                    aria-pressed={selected}
                    className={`flex h-10 w-full flex-col items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                      firstTry ? "border-success/50 bg-success/10 text-success" : "border-warning/50 bg-warning/10 text-warning"
                    } ${selected ? "ring-2 ring-primary" : ""}`}
                  >
                    <span>{i + 1}</span>
                    <span className="text-[10px] leading-none">{firstTry ? "✓" : "↻"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {open && (
            <p className="animate-game-pop rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2 text-sm text-text-muted">
              <span className="font-semibold text-text">Q{questions.indexOf(open) + 1}. </span>
              {open.prompt}
              <span className={`ml-1 text-xs font-semibold ${(firstTryCorrect[open.id] ?? true) ? "text-success" : "text-warning"}`}>
                {(firstTryCorrect[open.id] ?? true) ? "-- right first try" : "-- needed a retry"}
              </span>
            </p>
          )}
          <p className="flex gap-4 text-[11px] text-text-faint">
            <span>
              <span className="text-success">✓</span> right first try
            </span>
            <span>
              <span className="text-warning">↻</span> needed a retry
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-soft px-4 py-3 sm:px-5">
          {!result.passed && <Button onClick={onRetry}>↻ Try Again</Button>}
          {result.passed && <Button onClick={onContinue}>Continue ▶</Button>}
        </div>
      </Card>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-text-faint">{label}</p>
      <p className={`font-mono-tabular text-lg font-semibold ${highlight ? "text-xp" : "text-text"}`}>{value}</p>
    </div>
  );
}
