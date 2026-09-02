export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  createdAt: number;
}

export interface ModuleMeta {
  id: string; // e.g. "module-1"
  order: number; // 1..10
  title: string;
  description: string;
  requiresModuleId: string | null;
  /** Cover photo shown on the module's lobby card. Real photos (not renders/icons),
   * credited per their license -- see /public/modules/module-N/hero.webp. */
  heroImage?: { url: string; credit: string };
}

export type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

/** Per-task quiz progress, keyed by taskId on UserModuleProgress.taskQuizzes -- each task now
 * has its own 15-question quiz instead of the module having one shared quiz. */
export interface TaskQuizProgress {
  bestScorePct: number | null;
  attemptCount: number;
  passed: boolean;
  /** Whether a hint charge has already been spent on the attempt currently in progress --
   * caps hints at one per attempt regardless of how many are banked. Reset on each submit. */
  hintUsedThisAttempt: boolean;
  /** Server-tracked state for the attempt currently in progress. A learner can keep retrying a
   * question (each wrong try costs a heart) until it's right. attemptedIds is every question
   * that's had at least one answer submitted (right or wrong) -- it's what "first try" is judged
   * against. answeredIds is every question answered correctly at least once (the attempt is done
   * once this covers every question). correctFirstTryIds is the subset gotten right on the very
   * first try, which is what the final score is computed from. Null between attempts. */
  currentAttempt: { attemptedIds: string[]; answeredIds: string[]; correctFirstTryIds: string[] } | null;
}

export interface UserModuleProgress {
  uid: string;
  moduleId: string;
  status: ModuleStatus;
  lessonCompletedAt: number | null;
  activityCompletedAt: number | null;
  /** Union of every activity item id ever submitted as found/checked, across all task pages --
   * lets each task submit just its own slice while the module's activity completes once this
   * set covers every required id. */
  activityCheckedIds: string[];
  /** Keyed by taskId. A module is complete once every one of its tasks has a passed entry here
   * (in addition to activityCompletedAt). */
  taskQuizzes: Record<string, TaskQuizProgress>;
  completedAt: number | null;
  updatedAt: number;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  moduleId: string;
  taskId: string;
  submittedAt: number;
  answers: Record<string, string[]>;
  scorePct: number;
  passed: boolean;
  perfect: boolean;
}

/** One global, shared pool of hearts (not per-task/module) -- a wrong quiz answer anywhere costs
 * a heart; at 0 hearts no further quiz question can be attempted until at least one regenerates. */
export interface HeartsState {
  uid: string;
  current: number;
  /** When the next heart will regenerate, or null if already at max. Computed/advanced lazily
   * on every read -- see core/progress/hearts.ts. */
  nextRefillAt: number | null;
  updatedAt: number;
}

/** Single global settings row. Only the admin area writes to this. */
export interface AppSettings {
  heartRefillIntervalMs: number;
  /** Size of the shared hearts pool. Optional/absent on older settings rows -- falls back to
   * HEARTS_MAX (see core/progress/hearts.ts) until an admin explicitly saves a value. */
  heartsMax?: number;
}

export type XpEventType =
  | "lesson"
  | "activity"
  | "quiz_pass"
  | "quiz_perfect_bonus"
  | "module_complete"
  /** Spends XP (negative amount) to bank one quiz hint charge. Reuses the XP ledger
   * instead of a separate balance so a hint's cost is real and permanent -- it lowers
   * the same total that decides your level, not a free side-currency. */
  | "hint_purchase"
  /** Consumes one banked hint charge on a quiz question. Amount is always 0 -- the XP
   * was already spent at purchase time; this just marks the charge as used. */
  | "hint_used";

export interface XpEvent {
  id: string; // = dedupeKey, doubles as the idempotency guard
  uid: string;
  moduleId: string;
  type: XpEventType;
  amount: number;
  createdAt: number;
}

export interface DataStore {
  getUser(uid: string): Promise<UserProfile | null>;
  upsertUser(profile: UserProfile): Promise<void>;

  listModules(): Promise<ModuleMeta[]>;
  getModule(moduleId: string): Promise<ModuleMeta | null>;

  getUserProgress(uid: string): Promise<UserModuleProgress[]>;
  getModuleProgress(uid: string, moduleId: string): Promise<UserModuleProgress | null>;
  upsertModuleProgress(progress: UserModuleProgress): Promise<void>;

  recordQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt>;
  listQuizAttempts(uid: string, moduleId: string): Promise<QuizAttempt[]>;

  /** Returns false (no-op) if an event with this id already exists -- the idempotency guard. */
  recordXpEvent(event: XpEvent): Promise<boolean>;
  listXpEvents(uid: string): Promise<XpEvent[]>;
  hasXpEvent(uid: string, dedupeKey: string): Promise<boolean>;
  /** Atomically re-reads this user's full XP ledger and lets `decide` either approve a new
   * event against that *fresh* read or reject by returning null -- both happen as one
   * transaction/serialized write, so two concurrent calls (e.g. a double-clicked "buy hint")
   * can't both pass a check made against the same stale balance. Returns the recorded event,
   * or null if `decide` rejected it. */
  recordXpEventIfAllowed(uid: string, decide: (events: XpEvent[]) => XpEvent | null): Promise<XpEvent | null>;

  getHeartsState(uid: string): Promise<HeartsState | null>;
  upsertHeartsState(state: HeartsState): Promise<void>;

  getSettings(): Promise<AppSettings>;
  upsertSettings(settings: AppSettings): Promise<void>;

  /** Wipes this user's progress/quizAttempts/xpEvents and resets hearts to full. Leaves the
   * user profile (name/photo/email/account) untouched -- this is a progress reset, not account
   * deletion. */
  resetUserProgress(uid: string): Promise<void>;
}
