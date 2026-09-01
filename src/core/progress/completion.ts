import { getDataStore } from "@/core/data/store";
import type { UserModuleProgress } from "@/core/data/types";
import { getTasksForModule } from "@/core/content/tasks";
import { XP_VALUES } from "./constants";
import { awardXp } from "./xp";

export async function getOrCreateProgress(uid: string, moduleId: string): Promise<UserModuleProgress> {
  const store = getDataStore();
  const existing = await store.getModuleProgress(uid, moduleId);
  return (
    existing ?? {
      uid,
      moduleId,
      status: "available",
      lessonCompletedAt: null,
      activityCompletedAt: null,
      activityCheckedIds: [],
      taskQuizzes: {},
      completedAt: null,
      updatedAt: Date.now(),
    }
  );
}

/**
 * Recomputes status/completedAt from the progress row's current fields and
 * persists it. Safe to call after every lesson/activity/quiz event -- it's
 * the single place "is this module done?" is decided. Completion is
 * monotonic: activityCompletedAt, once set, never clears, and a task quiz
 * pass is never revoked, so a module can't un-complete itself.
 */
export async function evaluateAndMaybeCompleteModule(
  progress: UserModuleProgress,
): Promise<UserModuleProgress> {
  const store = getDataStore();
  const tasks = getTasksForModule(progress.moduleId);
  const allTaskQuizzesPassed =
    tasks.length > 0 && tasks.every((task) => progress.taskQuizzes[task.id]?.passed);
  const isComplete = progress.activityCompletedAt !== null && allTaskQuizzesPassed;
  const wasAlreadyComplete = progress.completedAt !== null;

  const updated: UserModuleProgress = {
    ...progress,
    status: isComplete ? "completed" : progress.lessonCompletedAt ? "in-progress" : progress.status,
    completedAt: isComplete ? (progress.completedAt ?? Date.now()) : null,
    updatedAt: Date.now(),
  };

  await store.upsertModuleProgress(updated);

  if (isComplete && !wasAlreadyComplete) {
    await awardXp({
      uid: progress.uid,
      moduleId: progress.moduleId,
      type: "module_complete",
      amount: XP_VALUES.module_complete,
    });
  }

  return updated;
}
