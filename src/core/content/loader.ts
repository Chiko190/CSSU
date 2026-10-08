import type { ActivityContent, ModuleContent, PracticalCheck, PublicQuizQuestion, QuizQuestion } from "./types";
import { module1Lessons } from "./module-1/lessons";
import { module1Activity } from "./module-1/activity";
import { module1TaskQuizzes } from "./module-1/quiz";
import { module1PracticalCheck, module1AssemblyPracticalCheck } from "./module-1/practicalCheck";
import { module1Task3Games, module1Task4Games, module1Task5Games } from "./module-1/games";
import { module2Lessons } from "./module-2/lessons";
import { module2Activity } from "./module-2/activity";
import { module2TaskQuizzes } from "./module-2/quiz";
import { module2WireOrderCheck } from "./module-2/practicalCheck";
import { module2Task2Games } from "./module-2/games";
import { module3Lessons } from "./module-3/lessons";
import { module3Activity } from "./module-3/activity";
import { module3TaskQuizzes } from "./module-3/quiz";
import { module3Task1Game, module3Task2Game } from "./module-3/practicalCheck";
import { module4Lessons } from "./module-4/lessons";
import { module4Activity } from "./module-4/activity";
import { module4TaskQuizzes } from "./module-4/quiz";
import { module4Task1Game } from "./module-4/practicalCheck";

// Single registration point for module content -- one module per TESDA CSS
// NC II unit of competency (UC1-UC4). Everything reads content exclusively
// through getModuleContent()/getTaskQuiz(), never by importing a module's data files directly.
const REGISTRY: Record<string, ModuleContent> = {
  "module-1": {
    moduleId: "module-1",
    lessons: module1Lessons,
    activity: module1Activity,
    heroModel: { url: "/models/cable.glb", rotation: [0, 0, Math.PI / 2.2] },
  },
  "module-2": {
    moduleId: "module-2",
    lessons: module2Lessons,
    activity: module2Activity,
    heroModel: { url: "/models/router.glb", credit: "\"3D Router\" by SanForge Studio (Sketchfab), CC BY 4.0" },
  },
  "module-3": {
    moduleId: "module-3",
    lessons: module3Lessons,
    activity: module3Activity,
    heroModel: { url: "/models/server-rack.glb", credit: "\"server rack\" by Jeremy Eyring (poly.pizza), CC BY 3.0" },
  },
  "module-4": {
    moduleId: "module-4",
    lessons: module4Lessons,
    activity: module4Activity,
  },
};

// Each task now has its own 15-question quiz (Record<taskId, QuizQuestion[]>) instead of the
// module having one shared quiz.
const TASK_QUIZ_REGISTRY: Record<string, Record<string, QuizQuestion[]>> = {
  "module-1": module1TaskQuizzes,
  "module-2": module2TaskQuizzes,
  "module-3": module3TaskQuizzes,
  "module-4": module4TaskQuizzes,
};

export function getModuleContent(moduleId: string): ModuleContent | null {
  return REGISTRY[moduleId] ?? null;
}

export function getTaskQuiz(moduleId: string, taskId: string): QuizQuestion[] | null {
  return TASK_QUIZ_REGISTRY[moduleId]?.[taskId] ?? null;
}

// Every task's quiz is gated by a game: hardware tasks (UC1 Task 1, UC2 Task 1) by a hands-on 3D
// check, UC1/UC2's software tasks by mini-game stages (sequence + match, see MiniGamesCheck), and
// UC3/UC4 by full mission games on a live network map (see MissionGameCheck). The one exception
// is UC1 Task 2, covered below.
//
// Module 1 Task 1's check is the full unguided sequence -- strip the PC, then rebuild it -- before
// its questions. The disassembly half's own "Final Check" is dropped so the only confirm step is
// the one at the very end; Task 2 (assembly) has no separate check, since the rebuild already
// happened here.
const PRACTICAL_CHECK_REGISTRY: Record<string, Record<string, PracticalCheck>> = {
  "module-1": {
    "task-1": {
      kind: "assembly",
      items: [
        ...module1PracticalCheck.filter((item) => item.id !== "final-check-pc"),
        ...module1AssemblyPracticalCheck,
      ],
    },
    "task-3": module1Task3Games,
    "task-4": module1Task4Games,
    "task-5": module1Task5Games,
  },
  "module-2": {
    "task-1": { kind: "wire-order", items: module2WireOrderCheck },
    "task-2": module2Task2Games,
  },
  "module-3": { "task-1": module3Task1Game, "task-2": module3Task2Game },
  "module-4": { "task-1": module4Task1Game },
};

/** The quiz-gating practical check for this task, or null if it doesn't have one (only UC1 Task 2,
 * whose rebuild is already part of Task 1's check). */
export function getPracticalCheck(moduleId: string, taskId: string): PracticalCheck | null {
  return PRACTICAL_CHECK_REGISTRY[moduleId]?.[taskId] ?? null;
}

/** Strips the answer key so quiz questions can be sent to the client before grading. */
export function stripQuizAnswers(quiz: QuizQuestion[]): PublicQuizQuestion[] {
  return quiz.map((q) => {
    const rest: Partial<QuizQuestion> = { ...q };
    delete rest.correctOptionIds;
    delete rest.explanation;
    return rest as PublicQuizQuestion;
  });
}

/** The set of ids the learner must identify/place to complete a TRY activity, regardless of its kind. */
export function getActivityRequiredIds(activity: ActivityContent): string[] {
  switch (activity.kind) {
    case "hotspot-2d":
      return activity.targets.map((t) => t.id);
    case "identify-3d":
      return activity.parts.map((p) => p.id);
    case "procedure-checklist":
      return activity.items.map((i) => i.id);
  }
}
