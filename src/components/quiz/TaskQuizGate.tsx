"use client";

import { useRouter } from "next/navigation";
import type { PracticalCheck } from "@/core/content/types";
import { PracticalCheckActivity } from "./PracticalCheckActivity";
import { WireOrderCheckActivity } from "./WireOrderCheckActivity";
import { MiniGamesCheckActivity } from "./MiniGamesCheckActivity";
import { MissionGameActivity } from "./MissionGameActivity";
import { QuizRunner } from "./QuizRunner";
import type { PublicQuizQuestion } from "@/core/content/types";
import type { PublicHeartsState } from "./types";

/** Sits in front of a task's multiple-choice quiz: if that task has a registered practical check
 * (see core/content/loader.ts's getPracticalCheck) and it isn't fully done yet, shows that game
 * instead and only reveals the quiz questions once it reports complete. Tasks with no practical
 * check just get QuizRunner. Which activity component renders depends on the check's `kind` --
 * see PracticalCheck's doc comment in core/content/types. */
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
    // Every step already persisted server-side -- refresh so this page's server component
    // re-reads progress and sees practicalDone flip to true.
    const onComplete = () => router.refresh();
    const shared = {
      moduleId,
      taskId,
      initialCheckedIds: initialPracticalCheckedIds,
      initialHearts: quizRunnerProps.initialHearts,
      onComplete,
    };

    switch (practicalCheck.kind) {
      case "assembly":
        return <PracticalCheckActivity {...shared} items={practicalCheck.items} />;
      case "wire-order":
        return <WireOrderCheckActivity {...shared} items={practicalCheck.items} />;
      case "mini-games":
        return <MiniGamesCheckActivity {...shared} check={practicalCheck} />;
      case "mission-game":
        return <MissionGameActivity {...shared} check={practicalCheck} />;
    }
  }

  return <QuizRunner moduleId={moduleId} taskId={taskId} {...quizRunnerProps} />;
}
