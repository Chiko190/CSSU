import type { ActivityContent, ModuleContent, PublicQuizQuestion, QuizQuestion } from "./types";
import { module1Lessons } from "./module-1/lessons";
import { module1Activity } from "./module-1/activity";
import { module1TaskQuizzes } from "./module-1/quiz";
import { module2Lessons } from "./module-2/lessons";
import { module2Activity } from "./module-2/activity";
import { module2TaskQuizzes } from "./module-2/quiz";
import { module3Lessons } from "./module-3/lessons";
import { module3Activity } from "./module-3/activity";
import { module3TaskQuizzes } from "./module-3/quiz";
import { module4Lessons } from "./module-4/lessons";
import { module4Activity } from "./module-4/activity";
import { module4TaskQuizzes } from "./module-4/quiz";

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
    heroModel: { url: "/models/router.glb", credit: "\"Modern Router\" by J-Toastie (poly.pizza), CC BY 3.0" },
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
