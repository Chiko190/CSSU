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
  bestQuizScorePct: number | null;
  quizAttemptCount: number;
  completedAt: number | null;
  updatedAt: number;
  /** Whether a hint charge has already been spent on the quiz attempt currently in
   * progress -- caps hints at one per attempt (not per bought charge) regardless of
   * how many are banked, so a learner with spare XP can't buy-use-buy-use their way
   * through every question in one sitting. Reset to false on each submit. */
  hintUsedThisAttempt: boolean;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  moduleId: string;
  submittedAt: number;
  answers: Record<string, string[]>;
  scorePct: number;
  passed: boolean;
  perfect: boolean;
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
}
