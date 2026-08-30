import "server-only";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import type {
  DataStore,
  QuizAttempt,
  UserModuleProgress,
  UserProfile,
  XpEvent,
} from "./types";
import { MODULE_CATALOG } from "./mockDb.seed";

function usersCol() {
  return getAdminFirestore().collection("users");
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
    return snap.docs.map((d) => d.data() as UserModuleProgress);
  },

  async getModuleProgress(uid, moduleId) {
    const snap = await usersCol().doc(uid).collection("progress").doc(moduleId).get();
    return snap.exists ? (snap.data() as UserModuleProgress) : null;
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

  // Reads every XP event for this user and writes the decided one inside a single
  // transaction, so two concurrent calls (e.g. a double-clicked "buy hint") can't both
  // read the same pre-write balance and both pass a check that should only pass once.
  async recordXpEventIfAllowed(uid, decide) {
    const col = usersCol().doc(uid).collection("xpEvents");
    return getAdminFirestore().runTransaction(async (tx) => {
      const snap = await tx.get(col);
      const events = snap.docs.map((d) => d.data() as XpEvent);
      const event = decide(events);
      if (!event) return null;
      tx.set(col.doc(event.id), event);
      return event;
    });
  },
};
