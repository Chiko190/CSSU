"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuizQuestion } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";
import { hashString, seededShuffle } from "@/lib/seededShuffle";
import { DialogueHeader, ProgressSegments } from "@/components/game/GameUi";
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
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ questionId: string; correct: boolean; correctOptionIds: string[]; explanation: string } | null>(null);
  const [checking, setChecking] = useState(false);
  // Synchronous guard against a double submit: state updates land a render later, so two Enter
  // presses (or a held key) in the same tick both saw checking === false and sent the answer twice --
  // a wrong answer then cost two hearts.
  const checkingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Bumped for a question each time it's answered wrong, so the retry reshuffles the options
  // instead of showing the exact same layout the learner just got wrong -- keyed by question id
  // (not just "current question") so it survives fine even though `question` below is re-derived
  // each render. Starts empty for every question on both server and client, so the very first
  // shuffle (seeded from the id alone, epoch 0) never causes a hydration mismatch; only a real
  // wrong-answer interaction (which can't happen during SSR) ever changes it.
  const [shuffleEpoch, setShuffleEpoch] = useState<Record<string, number>>({});

  const [hearts, setHearts] = useState(initialHearts);

  // Consecutive correct answers this session -- purely a motivational counter (the grade is still
  // first-try accuracy, computed server-side).
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const countdown = useCountdown(hearts.current <= 0 ? hearts.nextRefillAt : null);

  const question = useMemo(
    () => questions.find((q) => !answeredIds.has(q.id)) ?? null,
    [questions, answeredIds],
  );
  const allDone = question === null;

  const orderedOptions = useMemo(() => {
    if (!question) return [];
    const epoch = shuffleEpoch[question.id] ?? 0;
    return seededShuffle(question.options, hashString(`${question.id}:${epoch}`));
  }, [question, shuffleEpoch]);

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
    if (!question || !selectedOptionId || checkingRef.current) return;
    checkingRef.current = true;
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
        const next = streak + 1;
        setStreak(next);
        setBestStreak((best) => Math.max(best, next));
      } else {
        setStreak(0);
      }
      if (!res.correct) {
        // A wrong answer just spent a heart -- the header's count is server-rendered and
        // wouldn't otherwise pick that up until some other navigation happens.
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      await refreshHearts();
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }

  function handleContinueAfterFeedback() {
    if (!question || !feedback) return;
    if (feedback.correct) {
      setAnsweredIds((prev) => new Set(prev).add(question.id));
    } else {
      // Reshuffle so the retry doesn't just show the same option in the same spot they already
      // learned was wrong.
      setShuffleEpoch((prev) => ({ ...prev, [question.id]: (prev[question.id] ?? 0) + 1 }));
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
    setSelected({});
    setFeedback(null);
    setStreak(0);
    setBestStreak(0);
  }

  function handleContinue() {
    router.push(continueHref);
    router.refresh();
  }

  // Keyboard play: A-D (or 1-4) picks an answer, Enter checks / moves on -- quiz-show style.
  // Bound fresh each render so the handler always sees the current question and feedback state.
  useEffect(() => {
    if (result) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "Enter") {
        // Always handled here (and preventDefault-ed) so a focused button doesn't also fire its own
        // native click for the same key press; key-repeat from a held Enter is ignored.
        if (e.repeat) {
          e.preventDefault();
          return;
        }
        if (showingFeedback) {
          e.preventDefault();
          handleContinueAfterFeedback();
        } else if (selectedOptionId && !checking && !outOfHearts) {
          e.preventDefault();
          void handleCheck();
        }
        return;
      }
      if (showingFeedback || outOfHearts) return;
      const key = e.key.toLowerCase();
      const index = key >= "a" && key <= "d" ? key.charCodeAt(0) - 97 : key >= "1" && key <= "4" ? Number(key) - 1 : -1;
      const option = orderedOptions[index];
      if (option) selectOption(option.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (result) {
    return (
      <ScoreSummary
        questions={questions}
        firstTryCorrect={Object.fromEntries(questions.map((q) => [q.id, result.correctFirstTryIds.includes(q.id)]))}
        result={result}
        bestStreak={bestStreak}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  const doneCount = answeredIds.size;
  const questionNumber = Math.min(doneCount + 1, questions.length);
  const wrongShown = showingFeedback && !feedback!.correct;

  return (
    <Card className="relative overflow-hidden p-0">
      {/* Top bar -- same layout as the practical-check games' frame. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <p className="font-display text-sm font-bold text-text">🧠 Knowledge Check</p>
        <ProgressSegments total={questions.length} done={doneCount} />
        <div className="ml-auto flex items-center gap-3 text-xs font-semibold font-mono-tabular">
          <span
            key={streak}
            aria-label={`Streak: ${streak}`}
            className={streak >= 3 ? "text-xp animate-game-pop" : streak > 0 ? "text-text animate-game-pop" : "text-text-faint"}
          >
            🔥 x{streak}
          </span>
          <span className="flex" aria-label={`${hearts.current} of ${hearts.max} hearts`}>
            {Array.from({ length: hearts.max }, (_, i) => (
              <span key={i} className={i < hearts.current ? "" : "opacity-20 grayscale"}>
                ❤️
              </span>
            ))}
          </span>
        </div>
      </div>

      {allDone ? (
        <div className="border-t border-border-soft p-6 sm:p-8 text-center space-y-3">
          <p className="text-4xl">🏁</p>
          <p className="text-lg font-semibold text-text">All {questions.length} questions answered!</p>
          <p className="text-sm text-text-muted">Submit to see your score for this attempt.</p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Grading..." : "Submit Quiz"}
          </Button>
        </div>
      ) : (
        <>
          {/* A 3D part or photo is the question's "stage", full width like the games' play area. */}
          {question!.model3d && (
            <div className="h-[220px] sm:h-[260px] border-t border-border-soft bg-bg-elevated">
              <PartViewer shape={{ kind: "model", url: question!.model3d.url }} rotation={question!.model3d.rotation} />
            </div>
          )}
          {!question!.model3d && question!.imageUrl && (
            <div className="border-t border-border-soft bg-bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question!.imageUrl} alt={`Image for: ${question!.prompt}`} className="mx-auto max-h-[260px] w-full object-contain" />
              {question!.imageCredit && <p className="px-4 pb-2 text-[11px] text-text-faint">{question!.imageCredit}</p>}
            </div>
          )}

          <div
            // Re-keyed per question (pop in) and per wrong answer (shake) so the animation replays.
            key={wrongShown ? `${question!.id}-wrong` : question!.id}
            className={`border-t border-border-soft p-4 sm:p-5 space-y-4 ${wrongShown ? "animate-game-shake" : "animate-game-pop"}`}
          >
            <DialogueHeader
              icon="🧠"
              speaker={`Question ${questionNumber} of ${questions.length}`}
              meta={question!.type === "true_false" ? "true or false" : question!.type === "image_identification" ? "identify it" : "multiple choice"}
              line={question!.prompt}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orderedOptions.map((option, i) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrectOption = showingFeedback && feedback!.correctOptionIds.includes(option.id);
                const isWrongSelected = showingFeedback && isSelected && !feedback!.correct;
                const badge = isCorrectOption ? "✓" : isWrongSelected ? "✖" : String.fromCharCode(65 + i);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    disabled={showingFeedback || outOfHearts}
                    aria-pressed={isSelected}
                    className={`group flex items-center gap-2.5 text-left px-3 py-2.5 rounded-[var(--radius-md)] border text-sm transition-all ${
                      isCorrectOption
                        ? "border-success bg-success/10 text-text"
                        : isWrongSelected
                          ? "border-danger bg-danger/10 text-text"
                          : isSelected
                            ? "border-primary bg-primary/15 text-text shadow-[var(--shadow-glow-primary)] cursor-pointer"
                            : showingFeedback
                              ? "border-border bg-bg-elevated text-text-faint"
                              : "border-border bg-bg-elevated text-text hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        isCorrectOption
                          ? "bg-success text-[#03140d]"
                          : isWrongSelected
                            ? "bg-danger text-[#2b0410]"
                            : isSelected
                              ? "bg-primary text-[#04141c]"
                              : "bg-surface-2 text-text-muted group-hover:bg-primary/30"
                      }`}
                    >
                      {badge}
                    </span>
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>

            {showingFeedback && (
              <div
                className={`rounded-[var(--radius-md)] border px-3 py-2.5 ${
                  feedback!.correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/5"
                }`}
              >
                <p className={`text-sm font-semibold ${feedback!.correct ? "text-success" : "text-danger"}`}>
                  {feedback!.correct
                    ? streak >= 5
                      ? `🔥 Unstoppable! ${streak} in a row!`
                      : streak >= 3
                        ? `🔥 On fire! ${streak} in a row!`
                        : "✅ Correct!"
                    : "✖ Not quite -- try again. Streak reset."}
                </p>
                <p className="mt-1 text-sm text-text-muted">{feedback!.explanation}</p>
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="hidden sm:block text-[11px] text-text-faint">
                {showingFeedback ? "Press Enter to continue" : "Keys: A–D to pick · Enter to check"}
              </p>
              {showingFeedback ? (
                <Button onClick={handleContinueAfterFeedback} className="ml-auto">
                  {feedback!.correct ? "Next ▶" : "Try again ▶"}
                </Button>
              ) : (
                <Button onClick={handleCheck} disabled={!selectedOptionId || checking || outOfHearts} className="ml-auto">
                  {checking ? "Checking..." : "Check"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {outOfHearts && !allDone && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="text-center space-y-1">
            <p className="text-3xl">💔</p>
            <p className="text-base font-semibold text-danger">Out of hearts</p>
            <p className="text-sm text-text-muted">
              {countdown ? (
                <>
                  Next heart in <span className="font-mono-tabular">{countdown}</span>
                </>
              ) : (
                "Wait for a heart to refill."
              )}
            </p>
            <p className="text-xs text-text-faint">Your answers so far are saved.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
