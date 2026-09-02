"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuizQuestion } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";
import { ScoreSummary } from "./ScoreSummary";
import type { AnswerResponse, PublicHeartsState, QuizSubmitResponse } from "./types";

function useCountdown(targetMs: number | null): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (targetMs === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  if (targetMs === null) return null;
  const remainingMs = Math.max(0, targetMs - now);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function QuizRunner({
  moduleId,
  taskId,
  questions,
  initialHearts,
  initialAnsweredIds,
  continueHref,
}: {
  moduleId: string;
  taskId: string;
  questions: PublicQuizQuestion[];
  initialHearts: PublicHeartsState;
  /** Questions already answered correctly this attempt (e.g. after a page reload mid-quiz). */
  initialAnsweredIds: string[];
  /** Where "Continue" goes after passing -- the next task, or the module's complete page if this
   * was the last one. Decided server-side since it depends on the module's task order. */
  continueHref: string;
}) {
  const router = useRouter();
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set(initialAnsweredIds));
  const [firstTryCorrect, setFirstTryCorrect] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ questionId: string; correct: boolean; correctOptionIds: string[]; explanation: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hearts, setHearts] = useState(initialHearts);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const countdown = useCountdown(hearts.current <= 0 ? hearts.nextRefillAt : null);

  const question = useMemo(
    () => questions.find((q) => !answeredIds.has(q.id)) ?? null,
    [questions, answeredIds],
  );
  const allDone = question === null;

  const selectedOptionId = question ? selected[question.id] : undefined;
  const outOfHearts = hearts.current <= 0;
  const showingFeedback = feedback !== null && question !== null && feedback.questionId === question.id;

  async function refreshHearts() {
    try {
      const fresh = await apiFetch<PublicHeartsState>("/api/hearts");
      setHearts(fresh);
    } catch {
      // Best-effort -- the next interaction will surface any real problem.
    }
  }

  // While locked out, poll for the regenerated heart -- otherwise the countdown hits 0:00 and
  // just sits there forever, since nothing else would tell the client a heart came back.
  useEffect(() => {
    if (!outOfHearts) return;
    const id = setInterval(refreshHearts, 3000);
    return () => clearInterval(id);
  }, [outOfHearts]);

  function selectOption(optionId: string) {
    if (!question || showingFeedback || outOfHearts) return;
    setSelected((prev) => ({ ...prev, [question.id]: optionId }));
  }

  async function handleCheck() {
    if (!question || !selectedOptionId) return;
    setChecking(true);
    setError(null);
    try {
      const res = await apiFetch<AnswerResponse>(`/api/quiz/${moduleId}/${taskId}/answer`, {
        method: "POST",
        body: JSON.stringify({ questionId: question.id, optionIds: [selectedOptionId] }),
      });
      setHearts(res.hearts);
      setFeedback({
        questionId: question.id,
        correct: res.correct,
        correctOptionIds: res.correctOptionIds,
        explanation: res.explanation,
      });
      if (res.correct) {
        setFirstTryCorrect((prev) =>
          question.id in prev ? prev : { ...prev, [question.id]: true },
        );
      } else {
        setFirstTryCorrect((prev) => (question.id in prev ? prev : { ...prev, [question.id]: false }));
        // A wrong answer just spent a heart -- the header's count is server-rendered and
        // wouldn't otherwise pick that up until some other navigation happens.
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      await refreshHearts();
    } finally {
      setChecking(false);
    }
  }

  function handleContinueAfterFeedback() {
    if (!question || !feedback) return;
    if (feedback.correct) {
      setAnsweredIds((prev) => new Set(prev).add(question.id));
    }
    setFeedback(null);
    setSelected((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<QuizSubmitResponse>(`/api/quiz/${moduleId}/${taskId}/submit`, {
        method: "POST",
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
    setAnsweredIds(new Set());
    setFirstTryCorrect({});
    setSelected({});
    setFeedback(null);
  }

  function handleContinue() {
    router.push(continueHref);
    router.refresh();
  }

  if (result) {
    return (
      <ScoreSummary
        questions={questions}
        firstTryCorrect={firstTryCorrect}
        result={result}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-1" role="list" aria-label="Quiz progress">
          {questions.map((q) => (
            <div
              key={q.id}
              role="listitem"
              aria-label={`Question, ${answeredIds.has(q.id) ? "answered" : "not answered yet"}`}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                answeredIds.has(q.id) ? "bg-primary" : "bg-surface-2"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0" aria-label={`${hearts.current} of ${hearts.max} hearts`}>
          {Array.from({ length: hearts.max }, (_, i) => (
            <span key={i} className={i < hearts.current ? "" : "opacity-20 grayscale"}>
              ❤️
            </span>
          ))}
        </div>
      </div>

      {outOfHearts && (
        <Card className="p-4 border-danger/40 bg-danger/5 text-center">
          <p className="text-sm font-semibold text-danger">Out of hearts</p>
          <p className="mt-1 text-xs text-text-muted">
            {countdown ? (
              <>Next heart in <span className="font-mono-tabular">{countdown}</span></>
            ) : (
              "Wait for a heart to refill before answering again."
            )}
          </p>
        </Card>
      )}

      {allDone ? (
        <Card className="p-6 sm:p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-text">Every question answered correctly!</p>
          <p className="text-sm text-text-muted">Submit to see your score for this attempt.</p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Grading..." : "Submit Quiz"}
          </Button>
        </Card>
      ) : (
        <>
          <Card className="p-6 sm:p-8">
            {question!.model3d && (
              <div className="mb-4 rounded-[var(--radius-md)] overflow-hidden border border-border h-[240px] sm:h-[280px] bg-bg-elevated">
                <PartViewer shape={{ kind: "model", url: question!.model3d.url }} rotation={question!.model3d.rotation} />
              </div>
            )}
            {!question!.model3d && question!.imageUrl && (
              <div className="mb-4 rounded-[var(--radius-md)] overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={question!.imageUrl} alt={`Image for: ${question!.prompt}`} className="w-full" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-text mb-4">{question!.prompt}</h2>
            <div className="space-y-2">
              {question!.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrectOption = showingFeedback && feedback!.correctOptionIds.includes(option.id);
                const isWrongSelected = showingFeedback && isSelected && !feedback!.correct;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    disabled={showingFeedback || outOfHearts}
                    className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors ${
                      isCorrectOption
                        ? "border-success bg-success/10 text-text"
                        : isWrongSelected
                          ? "border-danger bg-danger/10 text-text"
                          : isSelected
                            ? "border-primary bg-primary/10 text-text cursor-pointer"
                            : "border-border bg-bg-elevated text-text-muted hover:border-primary/50 cursor-pointer disabled:cursor-not-allowed"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            {showingFeedback && (
              <div
                className={`mt-4 pt-4 border-t border-border-soft ${
                  feedback!.correct ? "text-success" : "text-danger"
                }`}
              >
                <p className="text-sm font-semibold">{feedback!.correct ? "Correct!" : "Not quite -- try again."}</p>
                <p className="mt-1 text-sm text-text-muted">{feedback!.explanation}</p>
              </div>
            )}
          </Card>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end">
            {showingFeedback ? (
              <Button onClick={handleContinueAfterFeedback}>Continue</Button>
            ) : (
              <Button onClick={handleCheck} disabled={!selectedOptionId || checking || outOfHearts}>
                {checking ? "Checking..." : outOfHearts ? "Out of hearts" : "Check"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
