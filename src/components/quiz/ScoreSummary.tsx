import type { PublicQuizQuestion } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle, IconSparkle, IconXCircle } from "@/components/ui/Icon";
import { PASS_THRESHOLD } from "@/core/progress/constants";
import type { QuizSubmitResponse } from "./types";

export function ScoreSummary({
  questions,
  firstTryCorrect,
  result,
  onRetry,
  onContinue,
}: {
  questions: PublicQuizQuestion[];
  /** Whether each question (by id) was answered correctly on the very first try this attempt --
   * every question ends up "correct" by the time you reach this screen (you have to get each one
   * right to move on), so this is what actually distinguishes a clean run from one with retries. */
  firstTryCorrect: Record<string, boolean>;
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
                Perfect score -- every question right on the first try!
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
              Not quite -- too many questions needed a retry. Try the quiz again.
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-text-faint">
          Passing score: {PASS_THRESHOLD}% (score reflects how many questions you got right on the first try)
        </p>
        {totalXp > 0 && <p className="mt-3 text-sm text-xp font-semibold">+{totalXp} XP earned</p>}
      </Card>

      <Card className="p-5 sm:p-6">
        <ul className="space-y-2">
          {questions.map((q, i) => {
            const gotItFirstTry = firstTryCorrect[q.id] ?? true;
            return (
              <li key={q.id} className="flex items-center gap-2.5 text-sm">
                {gotItFirstTry ? (
                  <IconCheckCircle className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <IconXCircle className="h-4 w-4 text-text-faint shrink-0" />
                )}
                <span className="text-text-muted truncate">
                  Q{i + 1}. {q.prompt}
                </span>
                {!gotItFirstTry && <span className="text-xs text-text-faint shrink-0 ml-auto">needed a retry</span>}
              </li>
            );
          })}
        </ul>
      </Card>

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
