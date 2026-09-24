"use client";

import { useRouter } from "next/navigation";
import type { PracticalCheck } from "@/core/content/types";
import { PracticalCheckActivity } from "./PracticalCheckActivity";
import { WireOrderCheckActivity } from "./WireOrderCheckActivity";
import { QuizRunner } from "./QuizRunner";
import type { PublicQuizQuestion } from "@/core/content/types";
import type { PublicHeartsState } from "./types";

/** Sits in front of a task's multiple-choice quiz: if that task has a registered practical check
 * (see core/content/loader.ts's getPracticalCheck) and it isn't fully done yet, shows that 3D
 * sequence instead and only reveals the quiz questions once it reports complete. Most tasks have
 * no practical check at all, in which case this is just QuizRunner. Which activity component
 * renders depends on the check's `kind` -- see PracticalCheck's doc comment in core/content/types. */
export function TaskQuizGate({
  moduleId,
  taskId,
  practicalCheck,
  initialPracticalCheckedIds,
  practicalDone,
  quizRunnerProps,
}: {
  moduleId: string;
  taskId: string;
  practicalCheck: PracticalCheck | null;
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

  if (practicalCheck && !practicalDone) {
    // The practical check's own last step already persisted server-side -- refresh so this
    // page's server component re-reads progress and sees practicalDone flip to true.
    const onComplete = () => router.refresh();

    if (practicalCheck.kind === "assembly") {
      return (
        <PracticalCheckActivity
          moduleId={moduleId}
          taskId={taskId}
          items={practicalCheck.items}
          initialCheckedIds={initialPracticalCheckedIds}
          onComplete={onComplete}
        />
      );
    }

    return (
      <WireOrderCheckActivity
        moduleId={moduleId}
        taskId={taskId}
        items={practicalCheck.items}
        initialCheckedIds={initialPracticalCheckedIds}
        onComplete={onComplete}
      />
    );
  }

  return <QuizRunner moduleId={moduleId} taskId={taskId} {...quizRunnerProps} />;
}
