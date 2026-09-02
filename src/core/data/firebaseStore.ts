import "server-only";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import type {
  AppSettings,
  DataStore,
  HeartsState,
  QuizAttempt,
  UserModuleProgress,
  UserProfile,
  XpEvent,
} from "./types";
import { MODULE_CATALOG } from "./mockDb.seed";
import { normalizeModuleProgress } from "./normalize";
import { DEFAULT_HEART_REFILL_INTERVAL_MS } from "@/core/progress/constants";

function usersCol() {
  return getAdminFirestore().collection("users");
}

function heartsCol() {
  return getAdminFirestore().collection("hearts");
}

const SETTINGS_DOC_PATH = ["settings", "global"] as const;

/** Deletes every doc in a collection/subcollection reference, batched. Firestore has no
 * "delete where" -- this is the standard client-side pattern for wiping a (small, per-user)
 * subcollection like progress/quizAttempts/xpEvents on a progress reset. */
async function deleteAllDocs(ref: FirebaseFirestore.CollectionReference | FirebaseFirestore.Query): Promise<void> {
  const snap = await ref.get();
  if (snap.empty) return;
  const db = getAdminFirestore();
  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();
}

export const firebaseStore: DataStore = {
  async getUser(uid) {
    const snap = await usersCol().doc(uid).get();
    return snap.exists ? (snap.data() as UserProfile) : null;
  },

  async upsertUser(profile) {
    await usersCol().doc(profile.uid).set(profile, { merge: true });
  },

  // The module catalog is static app content defined in code, not per-environment
  // data, so it's served directly rather than round-tripped through Firestore.
  async listModules() {
    return [...MODULE_CATALOG].sort((a, b) => a.order - b.order);
  },

  async getModule(moduleId) {
    return MODULE_CATALOG.find((m) => m.id === moduleId) ?? null;
  },

  async getUserProgress(uid) {
    const snap = await usersCol().doc(uid).collection("progress").get();
    return snap.docs.map((d) => normalizeModuleProgress(d.data() as UserModuleProgress));
  },

  async getModuleProgress(uid, moduleId) {
    const snap = await usersCol().doc(uid).collection("progress").doc(moduleId).get();
    return snap.exists ? normalizeModuleProgress(snap.data() as UserModuleProgress) : null;
  },

  async upsertModuleProgress(progress) {
    await usersCol()
      .doc(progress.uid)
      .collection("progress")
      .doc(progress.moduleId)
      .set(progress, { merge: true });
  },

  async recordQuizAttempt(attempt) {
    await usersCol().doc(attempt.uid).collection("quizAttempts").doc(attempt.id).set(attempt);
    return attempt;
  },

  async listQuizAttempts(uid, moduleId) {
    const snap = await usersCol()
      .doc(uid)
      .collection("quizAttempts")
      .where("moduleId", "==", moduleId)
      .orderBy("submittedAt")
      .get();
    return snap.docs.map((d) => d.data() as QuizAttempt);
  },

  // Uses a transaction (rather than a plain get-then-set) so the idempotency
  // guard holds even if two requests for the same event race each other.
  async recordXpEvent(event) {
    const ref = usersCol().doc(event.uid).collection("xpEvents").doc(event.id);
    return getAdminFirestore().runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists) return false;
      tx.set(ref, event);
      return true;
    });
  },

  async listXpEvents(uid) {
    const snap = await usersCol().doc(uid).collection("xpEvents").get();
    return snap.docs.map((d) => d.data() as XpEvent);
  },

  async hasXpEvent(uid, dedupeKey) {
    const snap = await usersCol().doc(uid).collection("xpEvents").doc(dedupeKey).get();
    return snap.exists;
  },

  async getHeartsState(uid) {
    const snap = await heartsCol().doc(uid).get();
    return snap.exists ? (snap.data() as HeartsState) : null;
  },

  async upsertHeartsState(state) {
    await heartsCol().doc(state.uid).set(state, { merge: true });
  },

  async getSettings() {
    const snap = await getAdminFirestore().doc(SETTINGS_DOC_PATH.join("/")).get();
    if (!snap.exists) return { heartRefillIntervalMs: DEFAULT_HEART_REFILL_INTERVAL_MS };
    return snap.data() as AppSettings;
  },

  async upsertSettings(settings) {
    await getAdminFirestore().doc(SETTINGS_DOC_PATH.join("/")).set(settings, { merge: true });
  },

  async resetUserProgress(uid) {
    const userDoc = usersCol().doc(uid);
    await Promise.all([
      deleteAllDocs(userDoc.collection("progress")),
      deleteAllDocs(userDoc.collection("quizAttempts")),
      deleteAllDocs(userDoc.collection("xpEvents")),
      heartsCol().doc(uid).delete(),
    ]);
  },
};
