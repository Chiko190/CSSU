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
}

export type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

export interface UserModuleProgress {
  uid: string;
  moduleId: string;
  status: ModuleStatus;
  lessonCompletedAt: number | null;
  activityCompletedAt: number | null;
  bestQuizScorePct: number | null;
  quizAttemptCount: number;
  completedAt: number | null;
  updatedAt: number;
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
  | "module_complete";

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
}
