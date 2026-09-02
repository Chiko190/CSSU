"use client";

import { useRouter } from "next/navigation";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { PracticalCheckActivity } from "./PracticalCheckActivity";
import { QuizRunner } from "./QuizRunner";
import type { PublicQuizQuestion } from "@/core/content/types";
import type { PublicHeartsState } from "./types";

/** Sits in front of a task's multiple-choice quiz: if that task has a registered practical check
 * (see core/content/loader.ts's getPracticalCheck) and it isn't fully done yet, shows that 3D
 * sequence instead and only reveals the quiz questions once it reports complete. Most tasks have
 * no practical check at all, in which case this is just QuizRunner. */
export function TaskQuizGate({
  moduleId,
  taskId,
  practicalItems,
  initialPracticalCheckedIds,
  practicalDone,
  quizRunnerProps,
}: {
  moduleId: string;
  taskId: string;
  practicalItems: ProcedureChecklistItem[] | null;
  initialPracticalCheckedIds: string[];
  practicalDone: boolean;
  quizRunnerProps: {
    questions: PublicQuizQuestion[];
    initialHearts: PublicHeartsState;
    initialAnsweredIds: string[];
    continueHref: string;
  };
}) {
  const router = useRouter();

  if (practicalItems && !practicalDone) {
    return (
      <PracticalCheckActivity
        moduleId={moduleId}
        taskId={taskId}
        items={practicalItems}
        initialCheckedIds={initialPracticalCheckedIds}
        // The practical check's own last step already persisted server-side -- refresh so this
        // page's server component re-reads progress and sees practicalDone flip to true.
        onComplete={() => router.refresh()}
      />
    );
  }

  return <QuizRunner moduleId={moduleId} taskId={taskId} {...quizRunnerProps} />;
}
