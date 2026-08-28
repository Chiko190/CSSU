import type { PublicQuizQuestion } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle, IconSparkle, IconXCircle } from "@/components/ui/Icon";
import { PASS_THRESHOLD } from "@/core/progress/constants";
import type { QuizSubmitResponse } from "./types";

export function ScoreSummary({
  questions,
  answers,
  result,
  onRetry,
  onContinue,
}: {
  questions: PublicQuizQuestion[];
  answers: Record<string, string[]>;
  result: QuizSubmitResponse;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const totalXp = result.xpAwarded.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <Card className={`p-6 sm:p-8 text-center ${result.passed ? "border-success/40" : "border-danger/40"}`}>
        <p className="text-sm text-text-muted mb-1">Quiz Results</p>
        <p className={`font-display text-4xl font-bold ${result.passed ? "text-success" : "text-danger"}`}>
          {result.scorePct}%
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-text">
          {result.passed ? (
            result.perfect ? (
              <>
                <IconSparkle className="h-4 w-4 text-xp" />
                Perfect score!
              </>
            ) : (
              <>
                <IconCheckCircle className="h-4 w-4 text-success" />
                You passed!
              </>
            )
          ) : (
            <>
              <IconXCircle className="h-4 w-4 text-danger" />
              Not quite -- review the explanations below and try again.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-text-faint">Passing score: {PASS_THRESHOLD}%</p>
        {totalXp > 0 && <p className="mt-3 text-sm text-xp font-semibold">+{totalXp} XP earned</p>}
      </Card>

      <div className="space-y-3">
        {questions.map((q) => {
          const r = result.perQuestionResult.find((pr) => pr.questionId === q.id);
          if (!r) return null;
          const selectedId = answers[q.id]?.[0];
          return (
            <Card
              key={q.id}
              className={`p-5 border-l-4 ${r.correct ? "border-l-success" : "border-l-danger"}`}
            >
              <p className="text-sm font-medium text-text mb-2">{q.prompt}</p>
              <p
                className={`flex items-center gap-1 text-xs font-semibold mb-1 ${r.correct ? "text-success" : "text-danger"}`}
              >
                {r.correct ? (
                  <IconCheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <IconXCircle className="h-3.5 w-3.5" />
                )}
                {r.correct ? "Correct" : "Not quite"}
              </p>
              {!r.correct && (
                <p className="text-xs text-text-faint mb-1">
                  You chose: {q.options.find((o) => o.id === selectedId)?.text ?? "(no answer)"}
                  {" — "}
                  Correct answer:{" "}
                  {q.options
                    .filter((o) => r.correctOptionIds.includes(o.id))
                    .map((o) => o.text)
                    .join(", ")}
                </p>
              )}
              <p className="text-sm text-text-muted">{r.explanation}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        {!result.passed && (
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {result.passed && <Button onClick={onContinue}>Continue</Button>}
      </div>
    </div>
  );
}
