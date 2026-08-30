import { getDataStore } from "@/core/data/store";
import type { UserModuleProgress } from "@/core/data/types";
import { PASS_THRESHOLD, XP_VALUES } from "./constants";
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
      bestQuizScorePct: null,
      quizAttemptCount: 0,
      completedAt: null,
      updatedAt: Date.now(),
      hintUsedThisAttempt: false,
    }
  );
}

/**
 * Recomputes status/completedAt from the progress row's current fields and
 * persists it. Safe to call after every lesson/activity/quiz event -- it's
 * the single place "is this module done?" is decided. Completion is
 * monotonic: bestQuizScorePct only ever increases and activityCompletedAt,
 * once set, never clears, so a module can't un-complete itself.
 */
export async function evaluateAndMaybeCompleteModule(
  progress: UserModuleProgress,
): Promise<UserModuleProgress> {
  const store = getDataStore();
  const isComplete =
    progress.activityCompletedAt !== null && (progress.bestQuizScorePct ?? 0) >= PASS_THRESHOLD;
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
