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

export interface LevelDef {
  level: number;
  name: string;
  minXp: number;
}

// Thresholds are tuned so completing all 4 modules (one per UC) at a
// non-perfect pace (20+50+50+100 = 220 XP each, 880 total) lands a learner
// right at the final level; perfect-quiz bonuses (+25/module, up to 980
// total) let them get there a little early within it.
export const LEVELS: LevelDef[] = [
  { level: 1, name: "Computer Rookie", minXp: 0 },
  { level: 2, name: "PC Technician", minXp: 220 },
  { level: 3, name: "Network Technician", minXp: 440 },
  { level: 4, name: "Systems Administrator", minXp: 660 },
  { level: 5, name: "CSS Master", minXp: 880 },
];
