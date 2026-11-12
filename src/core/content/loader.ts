import type { ActivityContent, ModuleContent, PracticalCheck, PublicQuizQuestion, QuizQuestion } from "./types";
import { module1Lessons } from "./module-1/lessons";
import { module1Activity } from "./module-1/activity";
import { module1TaskQuizzes } from "./module-1/quiz";
import { module1PracticalCheck, module1AssemblyPracticalCheck } from "./module-1/practicalCheck";
import { module2Lessons } from "./module-2/lessons";
import { module2Activity } from "./module-2/activity";
import { module2TaskQuizzes } from "./module-2/quiz";
import { module2WireOrderCheck } from "./module-2/practicalCheck";
import { module3Lessons } from "./module-3/lessons";
import { module3Activity } from "./module-3/activity";
import { module3TaskQuizzes } from "./module-3/quiz";
import { module3Task1Game, module3Task2Game } from "./module-3/practicalCheck";
import { module4Lessons } from "./module-4/lessons";
import { module4Activity } from "./module-4/activity";
import { module4TaskQuizzes } from "./module-4/quiz";
import { module4Task1Game, module4Task2Game } from "./module-4/practicalCheck";

// Single registration point for module content -- one module per TESDA CSS
// NC II unit of competency (UC1-UC4). Everything reads content exclusively
// through getModuleContent()/getTaskQuiz(), never by importing a module's data files directly.
const REGISTRY: Record<string, ModuleContent> = {
  "module-1": {
    moduleId: "module-1",
    lessons: module1Lessons,
    activity: module1Activity,
    introVideo: { url: "/modules/module-1/videos/intro.webm", seconds: 24 },
  },
  "module-2": {
    moduleId: "module-2",
    lessons: module2Lessons,
    activity: module2Activity,
    introVideo: { url: "/modules/module-2/videos/intro.webm", seconds: 23 },
    heroModel: { url: "/models/router.glb", credit: "\"3D Router\" by SanForge Studio (Sketchfab), CC BY 4.0" },
  },
  "module-3": {
    moduleId: "module-3",
    lessons: module3Lessons,
    activity: module3Activity,
    introVideo: { url: "/modules/module-3/videos/intro.webm", seconds: 24 },
    heroModel: { url: "/models/server-rack.glb", credit: "\"server rack\" by Jeremy Eyring (poly.pizza), CC BY 3.0" },
  },
  "module-4": {
    moduleId: "module-4",
    lessons: module4Lessons,
    activity: module4Activity,
    introVideo: { url: "/modules/module-4/videos/intro.webm", seconds: 24 },
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

/** How many questions each task quiz asks. The content files hold 15 per task; only the first
 * QUESTIONS_PER_TASK_QUIZ are used, so the rest can be brought back by raising this. */
const QUESTIONS_PER_TASK_QUIZ = 10;

export function getTaskQuiz(moduleId: string, taskId: string): QuizQuestion[] | null {
  return TASK_QUIZ_REGISTRY[moduleId]?.[taskId]?.slice(0, QUESTIONS_PER_TASK_QUIZ) ?? null;
}

// Quizzes are gated by a game where one fits: hardware tasks (UC1 Task 1, UC2 Task 1) by a
// hands-on 3D check, and UC3/UC4 by full mission games on a live network map (see
// MissionGameCheck). UC1/UC2's software tasks (UC1 Tasks 3-5, UC2 Task 2) go straight to their
// quiz, and UC1 Task 2 is covered below.
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
  },
  "module-2": {
    "task-1": { kind: "wire-order", items: module2WireOrderCheck },
  },
  "module-3": { "task-1": module3Task1Game, "task-2": module3Task2Game },
  "module-4": { "task-1": module4Task1Game, "task-2": module4Task2Game },
};

/** The quiz-gating practical check for this task, or null if it doesn't have one (UC1/UC2's
 * software tasks, and UC1 Task 2, whose rebuild is already part of Task 1's check). */
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

/** Whether `itemId` may be completed next given what's already done -- the server-side order
 * guard for the practical-check persistence route. Re-completing an already-done id is allowed
 * (idempotent retries); otherwise items must be completed strictly in order -- except for the
 * drag-and-drop wire-order check, where the pins of the current connector (standard) can be
 * filled in any order, but one connector must be finished before the next one opens. */
export function canCompletePracticalItem(check: PracticalCheck, checkedIds: Set<string>, itemId: string): boolean {
  if (checkedIds.has(itemId)) return true;
  if (check.kind === "wire-order") {
    const nextWire = check.items.find((item) => !checkedIds.has(item.id));
    const item = check.items.find((i) => i.id === itemId);
    return Boolean(nextWire && item && item.standard === nextWire.standard);
  }
  const next = check.items.find((item) => !checkedIds.has(item.id));
  return next?.id === itemId;
}
