import "server-only";
import { cache } from "react";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import type {
  AppSettings,
  CertificateRecord,
  DataStore,
  HeartsState,
  PointsState,
  QuizAttempt,
  UserModuleProgress,
  UserProfile,
  XpEvent,
} from "./types";
import { MODULE_CATALOG } from "./mockDb.seed";
import { normalizeModuleProgress } from "./normalize";
import { DEFAULT_HEART_REFILL_INTERVAL_MS } from "@/core/progress/constants";

// Read-cost notes (the free Spark plan caps Firestore at ~50k document reads/day):
// - Read methods are wrapped in React's cache(), so the (app) layout and the page it wraps share one
//   read per document within a single page render instead of each fetching their own copy. cache()
//   is scoped to one request and is a plain pass-through in route handlers, so writes are never
//   followed by a stale read.
// - The XP total lives in a single xpTotals/{uid} doc kept in step with xpEvents, instead of being
//   summed from every event on every page load.
// - App settings change rarely, so each server instance keeps them in memory for a short while.

function usersCol() {
  return getAdminFirestore().collection("users");
}

function heartsCol() {
  return getAdminFirestore().collection("hearts");
}

function pointsCol() {
  return getAdminFirestore().collection("points");
}

function xpTotalsCol() {
  return getAdminFirestore().collection("xpTotals");
}

// Top-level, keyed by certificate id, so the public verify page is a single doc read. Each user
// also gets users/{uid}/certificates/{moduleId} -- the one-per-module guard and profile listing.
function certificatesCol() {
  return getAdminFirestore().collection("certificates");
}

const SETTINGS_DOC_PATH = ["settings", "global"] as const;
const SETTINGS_TTL_MS = 60_000;
let settingsCache: { value: AppSettings; expiresAt: number } | null = null;

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

function sumXp(snap: FirebaseFirestore.QuerySnapshot): number {
  return snap.docs.reduce((sum, d) => sum + ((d.data() as XpEvent).amount ?? 0), 0);
}

const getUser = cache(async (uid: string) => {
  const snap = await usersCol().doc(uid).get();
  return snap.exists ? (snap.data() as UserProfile) : null;
});

const getUserProgress = cache(async (uid: string) => {
  const snap = await usersCol().doc(uid).collection("progress").get();
  return snap.docs.map((d) => normalizeModuleProgress(d.data() as UserModuleProgress));
});

const getModuleProgress = cache(async (uid: string, moduleId: string) => {
  const snap = await usersCol().doc(uid).collection("progress").doc(moduleId).get();
  return snap.exists ? normalizeModuleProgress(snap.data() as UserModuleProgress) : null;
});

const listXpEvents = cache(async (uid: string) => {
  const snap = await usersCol().doc(uid).collection("xpEvents").get();
  return snap.docs.map((d) => d.data() as XpEvent);
});

// Accounts from before xpTotals existed have no total doc yet -- the first read sums their events
// once and stores the result, inside a transaction so a concurrent XP award can't be lost.
const getTotalXp = cache(async (uid: string) => {
  const totalRef = xpTotalsCol().doc(uid);
  const snap = await totalRef.get();
  if (snap.exists) return (snap.get("total") as number) ?? 0;
  return getAdminFirestore().runTransaction(async (tx) => {
    const existing = await tx.get(totalRef);
    if (existing.exists) return (existing.get("total") as number) ?? 0;
    const total = sumXp(await tx.get(usersCol().doc(uid).collection("xpEvents")));
    tx.set(totalRef, { uid, total });
    return total;
  });
});

const getHeartsState = cache(async (uid: string) => {
  const snap = await heartsCol().doc(uid).get();
  return snap.exists ? (snap.data() as HeartsState) : null;
});

const getPointsState = cache(async (uid: string) => {
  const snap = await pointsCol().doc(uid).get();
  return snap.exists ? (snap.data() as PointsState) : null;
});

const getSettings = cache(async (): Promise<AppSettings> => {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) return settingsCache.value;
  const snap = await getAdminFirestore().doc(SETTINGS_DOC_PATH.join("/")).get();
  const value = snap.exists
    ? (snap.data() as AppSettings)
    : { heartRefillIntervalMs: DEFAULT_HEART_REFILL_INTERVAL_MS };
  settingsCache = { value, expiresAt: now + SETTINGS_TTL_MS };
  return value;
});

export const firebaseStore: DataStore = {
  getUser,

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

  getUserProgress,

  getModuleProgress,

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
  // guard holds even if two requests for the same event race each other. The
  // xpTotals doc is updated in the same transaction so it never drifts.
  async recordXpEvent(event) {
    const eventsCol = usersCol().doc(event.uid).collection("xpEvents");
    const ref = eventsCol.doc(event.id);
    const totalRef = xpTotalsCol().doc(event.uid);
    return getAdminFirestore().runTransaction(async (tx) => {
      const [existing, totalSnap] = await Promise.all([tx.get(ref), tx.get(totalRef)]);
      if (existing.exists) return false;
      const previousTotal = totalSnap.exists
        ? ((totalSnap.get("total") as number) ?? 0)
        : sumXp(await tx.get(eventsCol));
      tx.set(ref, event);
      tx.set(totalRef, { uid: event.uid, total: previousTotal + event.amount });
      return true;
    });
  },

  listXpEvents,

  getTotalXp,

  async hasXpEvent(uid, dedupeKey) {
    const snap = await usersCol().doc(uid).collection("xpEvents").doc(dedupeKey).get();
    return snap.exists;
  },

  getHeartsState,

  async upsertHeartsState(state) {
    await heartsCol().doc(state.uid).set(state, { merge: true });
  },

  getPointsState,

  async upsertPointsState(state) {
    await pointsCol().doc(state.uid).set(state);
  },

  getSettings,

  async upsertSettings(settings) {
    settingsCache = null;
    await getAdminFirestore().doc(SETTINGS_DOC_PATH.join("/")).set(settings, { merge: true });
  },

  async issueCertificate(record) {
    const userRef = usersCol().doc(record.uid).collection("certificates").doc(record.moduleId);
    return getAdminFirestore().runTransaction(async (tx) => {
      const existing = await tx.get(userRef);
      if (existing.exists) return existing.data() as CertificateRecord;
      tx.set(userRef, record);
      tx.set(certificatesCol().doc(record.id), record);
      return record;
    });
  },

  async getCertificate(id) {
    const snap = await certificatesCol().doc(id).get();
    return snap.exists ? (snap.data() as CertificateRecord) : null;
  },

  async listCertificates(uid) {
    const snap = await usersCol().doc(uid).collection("certificates").get();
    return snap.docs.map((d) => d.data() as CertificateRecord);
  },

  async resetUserProgress(uid) {
    const userDoc = usersCol().doc(uid);
    await Promise.all([
      deleteAllDocs(userDoc.collection("progress")),
      deleteAllDocs(userDoc.collection("quizAttempts")),
      deleteAllDocs(userDoc.collection("xpEvents")),
      heartsCol().doc(uid).delete(),
      pointsCol().doc(uid).delete(),
      xpTotalsCol().doc(uid).delete(),
    ]);
  },
};
