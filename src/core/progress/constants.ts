export const PASS_THRESHOLD = 70;

export const XP_VALUES = {
  lesson: 20,
  activity: 50,
  quiz_pass: 50,
  quiz_perfect_bonus: 25,
  module_complete: 100,
} as const;

// Hearts are a global pool (not per-task/module): a wrong quiz answer anywhere costs one, and at
// 0 hearts no further question can be attempted until at least one regenerates. Both the pool
// size and the refill interval are admin-editable (see AppSettings / the admin settings route);
// this value is just the fallback used until an admin ever saves a heartsMax setting.
export const HEARTS_MAX = 5;
export const DEFAULT_HEART_REFILL_INTERVAL_MS = 60_000;

// Points are a global balance too: every quiz question is worth 1 point (paid once, the first time
// it's answered correctly), and skipping a question costs SKIP_COST_POINTS and reveals its answer.
export const POINTS_PER_QUESTION = 1;
export const SKIP_COST_POINTS = 10;

export interface LevelDef {
  level: number;
  name: string;
  minXp: number;
}

// One level per completed module, after the starting level. The XP thresholds aren't listed here:
// they depend on how many tasks (and so task quizzes) each module has, so core/progress/xp.ts
// derives them from the task list. That keeps this file free of content imports, which matters
// because client components import it (e.g. ScoreSummary for PASS_THRESHOLD) and content
// includes the quiz answer keys.
export const LEVEL_NAMES = [
  "Computer Rookie",
  "PC Technician",
  "Network Technician",
  "Systems Administrator",
  "CSS Master",
] as const;
