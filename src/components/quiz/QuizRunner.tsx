"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuizQuestion } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";
import { HINT_COST_XP, HINT_MAX_STACK } from "@/core/progress/constants";
import { ScoreSummary } from "./ScoreSummary";
import type { QuizSubmitResponse } from "./types";

export function QuizRunner({
  moduleId,
  questions,
  initialHintBalance,
  initialTotalXp,
  initialHintUsedThisAttempt,
}: {
  moduleId: string;
  questions: PublicQuizQuestion[];
  /** How many hint charges the learner already has banked (from the profile's Hint Shop). */
  initialHintBalance: number;
  initialTotalXp: number;
  /** Whether a hint was already spent on this quiz attempt -- the server caps hint *use*
   * (not the bank) at one per attempt, so this can be true on reload even with charges left. */
  initialHintUsedThisAttempt: boolean;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const [hintBalance, setHintBalance] = useState(initialHintBalance);
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [hintUsedThisAttempt, setHintUsedThisAttempt] = useState(initialHintUsedThisAttempt);
  const [hintError, setHintError] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  // Per-question eliminated option, once revealed.
  const [eliminated, setEliminated] = useState<Record<string, string>>({});

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;
  const selected = answers[question.id]?.[0];
  const hintEligible = question.options.length > 2;
  const hintUsedOnThisQuestion = Boolean(eliminated[question.id]);

  function selectOption(optionId: string) {
    if (optionId === eliminated[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: [optionId] }));
  }

  async function handleUseHint() {
    setHintLoading(true);
    setHintError(null);
    try {
      const res = await apiFetch<{ balance: number; eliminatedOptionId: string }>(
        `/api/quiz/${moduleId}/hint`,
        { method: "POST", body: JSON.stringify({ questionId: question.id }) },
      );
      setHintBalance(res.balance);
      setHintUsedThisAttempt(true);
      setEliminated((prev) => ({ ...prev, [question.id]: res.eliminatedOptionId }));
      if (selected === res.eliminatedOptionId) {
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[question.id];
          return next;
        });
      }
      // Spending a hint doesn't touch anything the quiz view itself reads from the
      // server, but the header's XP total does -- keep it from reading stale.
      router.refresh();
    } catch (err) {
      setHintError(err instanceof Error ? err.message : "Couldn't use a hint");
    } finally {
      setHintLoading(false);
    }
  }

  async function handleBuyHint() {
    setHintLoading(true);
    setHintError(null);
    try {
      const res = await apiFetch<{ balance: number; totalXp: number }>("/api/hints/buy", { method: "POST" });
      setHintBalance(res.balance);
      setTotalXp(res.totalXp);
      router.refresh();
    } catch (err) {
      setHintError(err instanceof Error ? err.message : "Couldn't buy a hint");
    } finally {
      setHintLoading(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<QuizSubmitResponse>(`/api/quiz/${moduleId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
    setIndex(0);
    // The submit that just happened already reset the server-side flag -- a retry is a
    // fresh attempt, so it gets its own hint charge and a clean slate of eliminated options.
    setHintUsedThisAttempt(false);
    setEliminated({});
  }

  function handleContinue() {
    router.push(`/modules/${moduleId}/complete`);
    router.refresh();
  }

  function handleSkip() {
    if (isLast) {
      handleSubmit();
    } else {
      setIndex((i) => Math.min(questions.length - 1, i + 1));
    }
  }

  if (result) {
    return (
      <ScoreSummary
        questions={questions}
        answers={answers}
        result={result}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5" role="list" aria-label="Quiz progress">
        {questions.map((q, i) => (
          <div
            key={q.id}
            role="listitem"
            aria-label={`Question ${i + 1}${answers[q.id] ? ", answered" : i === index ? ", current" : ", not answered yet"}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              answers[q.id] ? "bg-primary" : i === index ? "bg-primary/40" : "bg-surface-2"
            }`}
          />
        ))}
      </div>

      <Card className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
          Question {index + 1} / {questions.length}
        </p>
        {question.imageUrl && (
          <div className="mb-4 rounded-[var(--radius-md)] overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.imageUrl} alt={`Image for: ${question.prompt}`} className="w-full" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-text mb-4">{question.prompt}</h2>
        <div className="space-y-2">
          {question.options.map((option) => {
            const isEliminated = eliminated[question.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option.id)}
                disabled={isEliminated}
                className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors ${
                  isEliminated
                    ? "border-border/50 bg-transparent text-text-faint line-through cursor-not-allowed"
                    : selected === option.id
                      ? "border-primary bg-primary/10 text-text cursor-pointer"
                      : "border-border bg-bg-elevated text-text-muted hover:border-primary/50 cursor-pointer"
                }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {hintEligible && (
          <div className="mt-4 pt-4 border-t border-border-soft flex items-center gap-3 flex-wrap">
            {hintUsedOnThisQuestion ? (
              <p className="text-xs text-text-faint">💡 Hint used -- one wrong choice ruled out.</p>
            ) : hintUsedThisAttempt ? (
              <p className="text-xs text-text-faint">
                💡 You&apos;ve used your hint for this attempt -- try again on your next attempt.
              </p>
            ) : hintBalance > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleUseHint} disabled={hintLoading}>
                {hintLoading ? "Thinking..." : `💡 Use a hint (${hintBalance}/${HINT_MAX_STACK} banked)`}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBuyHint}
                disabled={hintLoading || totalXp < HINT_COST_XP}
                title={totalXp < HINT_COST_XP ? `Need ${HINT_COST_XP} XP` : undefined}
              >
                {hintLoading ? "Buying..." : `💡 Buy a hint (${HINT_COST_XP} XP)`}
              </Button>
            )}
            {hintError && <p className="text-xs text-danger">{hintError}</p>}
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleSkip} disabled={submitting}>
            Skip
          </Button>
          {isLast ? (
            <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
              {submitting ? "Grading..." : allAnswered ? "Submit Quiz" : "Answer all questions to submit"}
            </Button>
          ) : (
            <Button
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={!selected}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
