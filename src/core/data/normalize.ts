import type { UserModuleProgress } from "./types";

/** Backfills fields added to UserModuleProgress after documents already existed in
 * production -- taskQuizzes didn't exist when quizzes were module-level, so any progress row
 * written before that migration is missing it entirely. Every store read goes through this
 * rather than trusting the stored shape to already match the current type, since Firestore
 * (and the mock JSON file) don't enforce a schema and old rows are never retroactively rewritten
 * until their next write. */
export function normalizeModuleProgress(progress: UserModuleProgress): UserModuleProgress {
  let next = progress;
  if (!next.taskQuizzes) next = { ...next, taskQuizzes: {} };
  if (!next.practicalCheckedIds) next = { ...next, practicalCheckedIds: {} };
  return next;
}
