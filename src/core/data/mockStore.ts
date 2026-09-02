import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AppSettings,
  DataStore,
  HeartsState,
  ModuleMeta,
  QuizAttempt,
  UserModuleProgress,
  UserProfile,
  XpEvent,
} from "./types";
import { MODULE_CATALOG } from "./mockDb.seed";
import { normalizeModuleProgress } from "./normalize";
import { DEFAULT_HEART_REFILL_INTERVAL_MS } from "@/core/progress/constants";

interface DbShape {
  users: Record<string, UserProfile>;
  modules: Record<string, ModuleMeta>;
  progress: Record<string, Record<string, UserModuleProgress>>;
  quizAttempts: Record<string, Record<string, QuizAttempt[]>>;
  xpEvents: Record<string, Record<string, XpEvent>>;
  hearts: Record<string, HeartsState>;
  settings: AppSettings | null;
}

// Kept outside /src so it's never part of the Next.js module graph or watched
// by the dev server's file watcher, and outside /public so it's never served.
const DB_PATH = path.join(process.cwd(), ".data", "mockDb.json");

function emptyDb(): DbShape {
  return { users: {}, modules: {}, progress: {}, quizAttempts: {}, xpEvents: {}, hearts: {}, settings: null };
}

async function writeDbImmediate(db: DbShape): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function readDb(): Promise<DbShape> {
  let db: DbShape;
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    db = JSON.parse(raw) as DbShape;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      db = emptyDb();
    } else {
      throw err;
    }
  }

  // Fields added after this file's first release -- fill them in for DBs written by an older
  // version rather than crashing every reader on a missing key.
  db.hearts ??= {};
  db.settings ??= null;

  // Seeding happens inline here (not from a separate fire-and-forget call) so
  // every read is guaranteed to see the module catalog, with no startup race.
  if (Object.keys(db.modules).length === 0) {
    for (const m of MODULE_CATALOG) db.modules[m.id] = m;
    await writeDbImmediate(db);
  }

  return db;
}

// Serializes read-modify-write cycles so concurrent requests (e.g. rapid
// double-clicks) can't race each other and silently drop a write.
let writeQueue: Promise<unknown> = Promise.resolve();

async function mutate<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const result = writeQueue.then(async () => {
    const db = await readDb();
    const value = await fn(db);
    await writeDbImmediate(db);
    return value;
  });
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export const mockStore: DataStore = {
  async getUser(uid) {
    const db = await readDb();
    return db.users[uid] ?? null;
  },

  async upsertUser(profile) {
    await mutate((db) => {
      db.users[profile.uid] = profile;
    });
  },

  async listModules() {
    const db = await readDb();
    return Object.values(db.modules).sort((a, b) => a.order - b.order);
  },

  async getModule(moduleId) {
    const db = await readDb();
    return db.modules[moduleId] ?? null;
  },

  async getUserProgress(uid) {
    const db = await readDb();
    return Object.values(db.progress[uid] ?? {}).map(normalizeModuleProgress);
  },

  async getModuleProgress(uid, moduleId) {
    const db = await readDb();
    const progress = db.progress[uid]?.[moduleId];
    return progress ? normalizeModuleProgress(progress) : null;
  },

  async upsertModuleProgress(progress) {
    await mutate((db) => {
      db.progress[progress.uid] ??= {};
      db.progress[progress.uid][progress.moduleId] = progress;
    });
  },

  async recordQuizAttempt(attempt) {
    await mutate((db) => {
      db.quizAttempts[attempt.uid] ??= {};
      db.quizAttempts[attempt.uid][attempt.moduleId] ??= [];
      db.quizAttempts[attempt.uid][attempt.moduleId].push(attempt);
    });
    return attempt;
  },

  async listQuizAttempts(uid, moduleId) {
    const db = await readDb();
    return db.quizAttempts[uid]?.[moduleId] ?? [];
  },

  async recordXpEvent(event) {
    return mutate((db) => {
      db.xpEvents[event.uid] ??= {};
      if (db.xpEvents[event.uid][event.id]) {
        return false;
      }
      db.xpEvents[event.uid][event.id] = event;
      return true;
    });
  },

  async listXpEvents(uid) {
    const db = await readDb();
    return Object.values(db.xpEvents[uid] ?? {});
  },

  async hasXpEvent(uid, dedupeKey) {
    const db = await readDb();
    return Boolean(db.xpEvents[uid]?.[dedupeKey]);
  },

  async getHeartsState(uid) {
    const db = await readDb();
    return db.hearts[uid] ?? null;
  },

  async upsertHeartsState(state) {
    await mutate((db) => {
      db.hearts[state.uid] = state;
    });
  },

  async getSettings() {
    const db = await readDb();
    return db.settings ?? { heartRefillIntervalMs: DEFAULT_HEART_REFILL_INTERVAL_MS };
  },

  async upsertSettings(settings) {
    await mutate((db) => {
      db.settings = settings;
    });
  },

  async resetUserProgress(uid) {
    await mutate((db) => {
      delete db.progress[uid];
      delete db.quizAttempts[uid];
      delete db.xpEvents[uid];
      delete db.hearts[uid];
    });
  },
};
