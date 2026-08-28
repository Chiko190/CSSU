"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuizQuestion } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";
import { ScoreSummary } from "./ScoreSummary";
import type { QuizSubmitResponse } from "./types";

export function QuizRunner({ moduleId, questions }: { moduleId: string; questions: PublicQuizQuestion[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;
  const selected = answers[question.id]?.[0];

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: [optionId] }));
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
      <div className="flex items-center gap-1.5">
        {questions.map((q, i) => (
          <div
            key={q.id}
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
            <img src={question.imageUrl} alt="" className="w-full" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-text mb-4">{question.prompt}</h2>
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option.id)}
              className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors cursor-pointer ${
                selected === option.id
                  ? "border-primary bg-primary/10 text-text"
                  : "border-border bg-bg-elevated text-text-muted hover:border-primary/50"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
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
