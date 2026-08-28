import type { DataStore } from "./types";

/**
 * Stub satisfying DataStore so the app compiles with NEXT_PUBLIC_PROVIDER=firebase
 * before a real Firestore project exists.
 *
 * To activate: `npm install firebase-admin`, configure FIREBASE_SERVICE_ACCOUNT_JSON,
 * then implement each method against Firestore using the collection layout documented
 * in the Phase 1 plan (users/{uid}, users/{uid}/progress/{moduleId},
 * users/{uid}/quizAttempts/{attemptId}, users/{uid}/xpEvents/{dedupeKey}, modules/{moduleId}) --
 * keeping the same DataStore method signatures so no calling code changes.
 */
function unconfigured(): never {
  throw new Error(
    "Firebase data store is not configured yet. Add FIREBASE_SERVICE_ACCOUNT_JSON to your " +
      "environment and implement src/core/data/firebaseStore.ts, then set NEXT_PUBLIC_PROVIDER=firebase.",
  );
}

export const firebaseStore: DataStore = {
  getUser: () => unconfigured(),
  upsertUser: () => unconfigured(),
  listModules: () => unconfigured(),
  getModule: () => unconfigured(),
  getUserProgress: () => unconfigured(),
  getModuleProgress: () => unconfigured(),
  upsertModuleProgress: () => unconfigured(),
  recordQuizAttempt: () => unconfigured(),
  listQuizAttempts: () => unconfigured(),
  recordXpEvent: () => unconfigured(),
  listXpEvents: () => unconfigured(),
  hasXpEvent: () => unconfigured(),
};
