import { randomUUID } from "node:crypto";
import { getDataStore } from "@/core/data/store";
import type { QuizAttempt, TaskQuizProgress, UserModuleProgress } from "@/core/data/types";
import { getPracticalCheck, getTaskQuiz } from "@/core/content/loader";
import { getTask, getTasksForModule, isTaskUnlockedForProgress } from "@/core/content/tasks";
import { getHearts, loseHeart, type PublicHeartsState } from "./hearts";
import { getOrCreateProgress, evaluateAndMaybeCompleteModule } from "./completion";
import { awardXp } from "./xp";
import { awardQuestionPoint, getPoints, questionKey, spendSkipPoints, type PublicPointsState } from "./points";
import { PASS_THRESHOLD, XP_VALUES } from "./constants";

export class NoHeartsError extends Error {
  nextRefillAt: number | null;
  constructor(nextRefillAt: number | null) {
    super("Out of hearts -- wait for one to refill before answering.");
    this.name = "NoHeartsError";
    this.nextRefillAt = nextRefillAt;
  }
}

export class UnknownTaskQuizError extends Error {
  constructor(moduleId: string, taskId: string) {
    super(`No quiz content for ${moduleId}/${taskId}`);
    this.name = "UnknownTaskQuizError";
  }
}

/** A well-formed request that's invalid for the quiz's current state -- an unknown question id,
 * or submitting before every question's been answered correctly. Distinct from a validation
 * error (malformed body) so it maps to a clean 400 instead of falling through to a 500. */
export class InvalidQuizStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQuizStateError";
  }
}

function emptyTaskQuizProgress(): TaskQuizProgress {
  return {
    bestScorePct: null,
    attemptCount: 0,
    passed: false,
    currentAttempt: null,
  };
}

export function getTaskQuizProgress(
  progress: { taskQuizzes: Record<string, TaskQuizProgress> },
  taskId: string,
): TaskQuizProgress {
  return progress.taskQuizzes[taskId] ?? emptyTaskQuizProgress();
}

/** Server-side mirror of the quiz page's own gating: the task's checklist must be fully checked
 * and its practical check (if it has one) fully done. The page enforces this with a redirect /
 * TaskQuizGate, but the answer and submit routes are reachable directly, so without this a
 * learner could skip the hands-on part entirely with a couple of fetch() calls. */
function assertQuizGateOpen(progress: UserModuleProgress, moduleId: string, taskId: string): void {
  const task = getTask(moduleId, taskId);
  if (!task) throw new UnknownTaskQuizError(moduleId, taskId);
  if (!isTaskUnlockedForProgress(moduleId, taskId, progress)) {
    throw new InvalidQuizStateError("This task is still locked -- finish the task before it first.");
  }
  const checked = new Set(progress.activityCheckedIds);
  if (!task.itemIds.every((id) => checked.has(id))) {
    throw new InvalidQuizStateError("Finish this task's checklist before taking its quiz.");
  }
  const practicalCheck = getPracticalCheck(moduleId, taskId);
  if (practicalCheck) {
    const practicalChecked = new Set(progress.practicalCheckedIds[taskId] ?? []);
    if (!practicalCheck.items.every((item) => practicalChecked.has(item.id))) {
      throw new InvalidQuizStateError("Finish this task's practical check before answering the quiz.");
    }
  }
}

/** Narrows a saved attempt to the quiz's current questions -- an attempt started before the quiz
 * was shortened can still hold ids for questions it no longer asks. */
function currentQuestionIds(ids: string[], quiz: { id: string }[]): string[] {
  const inQuiz = new Set(quiz.map((q) => q.id));
  return ids.filter((id) => inQuiz.has(id));
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export interface AnswerResult {
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
  hearts: PublicHeartsState;
  points: PublicPointsState;
  /** True once every question in this task's quiz has been answered correctly at least once
   * this attempt -- the client can offer "Submit" once this is true. */
  done: boolean;
}

/** Grades one question against the real answer key and records it into the attempt currently in
 * progress. Throws NoHeartsError up front if hearts are already at 0 -- a wrong answer here
 * costs a heart in real time, which is the whole point of the hearts system. */
export async function answerTaskQuizQuestion(params: {
  uid: string;
  moduleId: string;
  taskId: string;
  questionId: string;
  optionIds: string[];
}): Promise<AnswerResult> {
  const { uid, moduleId, taskId, questionId, optionIds } = params;

  const quiz = getTaskQuiz(moduleId, taskId);
  if (!quiz) throw new UnknownTaskQuizError(moduleId, taskId);
  const question = quiz.find((q) => q.id === questionId);
  if (!question) throw new InvalidQuizStateError(`Unknown question: ${questionId}`);

  const store = getDataStore();
  let progress = await getOrCreateProgress(uid, moduleId);
  assertQuizGateOpen(progress, moduleId, taskId);

  const heartsBefore = await getHearts(uid);
  if (heartsBefore.current <= 0) {
    throw new NoHeartsError(heartsBefore.nextRefillAt);
  }

  const correct = sameSet(optionIds, question.correctOptionIds);

  const taskProgress = getTaskQuizProgress(progress, taskId);
  const attempt = taskProgress.currentAttempt ?? { attemptedIds: [], answeredIds: [], correctFirstTryIds: [] };

  const isFirstAttempt = !attempt.attemptedIds.includes(questionId);
  const nextAttempt = {
    attemptedIds: isFirstAttempt ? [...attempt.attemptedIds, questionId] : attempt.attemptedIds,
    answeredIds:
      correct && !attempt.answeredIds.includes(questionId)
        ? [...attempt.answeredIds, questionId]
        : attempt.answeredIds,
    correctFirstTryIds:
      correct && isFirstAttempt ? [...attempt.correctFirstTryIds, questionId] : attempt.correctFirstTryIds,
  };

  progress = {
    ...progress,
    taskQuizzes: {
      ...progress.taskQuizzes,
      [taskId]: { ...taskProgress, currentAttempt: nextAttempt },
    },
  };
  await store.upsertModuleProgress(progress);

  const hearts = correct ? heartsBefore : (await loseHeart(uid)).hearts;
  const points = correct ? await awardQuestionPoint(uid, questionKey(moduleId, taskId, questionId)) : await getPoints(uid);

  return {
    correct,
    correctOptionIds: question.correctOptionIds,
    explanation: question.explanation,
    hearts,
    points,
    done: currentQuestionIds(nextAttempt.answeredIds, quiz).length === quiz.length,
  };
}

export interface SkipResult {
  correctOptionIds: string[];
  explanation: string;
  points: PublicPointsState;
  done: boolean;
}

/** Spends SKIP_COST_POINTS to get past a question: it's marked answered (so the attempt can still
 * be finished) and attempted (so it can never count as correct on the first try -- a skip costs
 * the grade like a wrong answer would, just not a heart), and its answer is revealed. */
export async function skipTaskQuizQuestion(params: {
  uid: string;
  moduleId: string;
  taskId: string;
  questionId: string;
}): Promise<SkipResult> {
  const { uid, moduleId, taskId, questionId } = params;

  const quiz = getTaskQuiz(moduleId, taskId);
  if (!quiz) throw new UnknownTaskQuizError(moduleId, taskId);
  const question = quiz.find((q) => q.id === questionId);
  if (!question) throw new InvalidQuizStateError(`Unknown question: ${questionId}`);

  const store = getDataStore();
  let progress = await getOrCreateProgress(uid, moduleId);
  assertQuizGateOpen(progress, moduleId, taskId);

  const taskProgress = getTaskQuizProgress(progress, taskId);
  const attempt = taskProgress.currentAttempt ?? { attemptedIds: [], answeredIds: [], correctFirstTryIds: [] };
  if (attempt.answeredIds.includes(questionId)) {
    throw new InvalidQuizStateError("This question is already answered.");
  }

  const spent = await spendSkipPoints(uid);
  if (!spent.ok) {
    throw new InvalidQuizStateError(`You need ${spent.points.skipCost} points to skip a question.`);
  }

  const nextAttempt = {
    attemptedIds: attempt.attemptedIds.includes(questionId) ? attempt.attemptedIds : [...attempt.attemptedIds, questionId],
    answeredIds: [...attempt.answeredIds, questionId],
    correctFirstTryIds: attempt.correctFirstTryIds,
  };
  progress = {
    ...progress,
    taskQuizzes: {
      ...progress.taskQuizzes,
      [taskId]: { ...taskProgress, currentAttempt: nextAttempt },
    },
  };
  await store.upsertModuleProgress(progress);

  return {
    correctOptionIds: question.correctOptionIds,
    explanation: question.explanation,
    points: spent.points,
    done: currentQuestionIds(nextAttempt.answeredIds, quiz).length === quiz.length,
  };
}

export interface SubmitResult {
  scorePct: number;
  passed: boolean;
  perfect: boolean;
  xpAwarded: { type: string; amount: number }[];
  /** Questions answered correctly on the first try this attempt -- the server's record, so the
   * per-question summary stays accurate even if the page was reloaded mid-quiz. */
  correctFirstTryIds: string[];
}

/** Finalizes the attempt currently in progress -- requires every question to have been answered
 * correctly at least once (the client only offers Submit once answerTaskQuizQuestion reports
 * done: true, but this re-checks server-side rather than trusting that). Score reflects first-try
 * accuracy: mistakes cost the grade even though retries let the learner finish. */
export async function submitTaskQuiz(params: {
  uid: string;
  moduleId: string;
  taskId: string;
}): Promise<SubmitResult> {
  const { uid, moduleId, taskId } = params;

  const quiz = getTaskQuiz(moduleId, taskId);
  if (!quiz) throw new UnknownTaskQuizError(moduleId, taskId);

  let progress = await getOrCreateProgress(uid, moduleId);
  assertQuizGateOpen(progress, moduleId, taskId);
  const taskProgress = getTaskQuizProgress(progress, taskId);
  const attempt = taskProgress.currentAttempt;
  if (!attempt || currentQuestionIds(attempt.answeredIds, quiz).length < quiz.length) {
    throw new InvalidQuizStateError("Answer every question correctly at least once before submitting.");
  }

  const correctFirstTryIds = currentQuestionIds(attempt.correctFirstTryIds, quiz);
  const scorePct = Math.round((correctFirstTryIds.length / quiz.length) * 100);
  const passed = scorePct >= PASS_THRESHOLD;
  const perfect = scorePct === 100;

  const store = getDataStore();
  const quizAttempt: QuizAttempt = {
    id: randomUUID(),
    uid,
    moduleId,
    taskId,
    submittedAt: Date.now(),
    answers: {},
    scorePct,
    passed,
    perfect,
  };
  await store.recordQuizAttempt(quizAttempt);

  const xpAwarded: { type: string; amount: number }[] = [];
  if (passed) {
    const passEvent = await awardXp({ uid, moduleId, taskId, type: "quiz_pass", amount: XP_VALUES.quiz_pass });
    if (passEvent) xpAwarded.push({ type: passEvent.type, amount: passEvent.amount });
  }
  if (passed && perfect) {
    const bonusEvent = await awardXp({
      uid,
      moduleId,
      taskId,
      type: "quiz_perfect_bonus",
      amount: XP_VALUES.quiz_perfect_bonus,
    });
    if (bonusEvent) xpAwarded.push({ type: bonusEvent.type, amount: bonusEvent.amount });
  }

  progress = {
    ...progress,
    taskQuizzes: {
      ...progress.taskQuizzes,
      [taskId]: {
        bestScorePct: Math.max(taskProgress.bestScorePct ?? 0, scorePct),
        attemptCount: taskProgress.attemptCount + 1,
        passed: taskProgress.passed || passed,
        currentAttempt: null,
      },
    },
    status: progress.status === "available" ? "in-progress" : progress.status,
  };
  await store.upsertModuleProgress(progress);
  await evaluateAndMaybeCompleteModule(progress);

  return { scorePct, passed, perfect, xpAwarded, correctFirstTryIds };
}

/** The task that follows `taskId` in its module's order, or null if `taskId` was the last one. */
export function getNextTaskId(moduleId: string, taskId: string): string | null {
  const tasks = getTasksForModule(moduleId);
  const index = tasks.findIndex((t) => t.id === taskId);
  return index >= 0 ? (tasks[index + 1]?.id ?? null) : null;
}
