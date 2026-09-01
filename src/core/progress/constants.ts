export const PASS_THRESHOLD = 70;

export const XP_VALUES = {
  lesson: 20,
  activity: 50,
  quiz_pass: 50,
  quiz_perfect_bonus: 25,
  module_complete: 100,
} as const;

// A hint costs real, permanent XP (it's deducted from the same total that decides your
// level), not a free freebie -- 40 is roughly a fifth of one module's 220 XP reward, so
// stocking the full 3-hint stack (120 XP) is a real trade-off against leveling up, not
// something a learner can casually spam every quiz question.
export const HINT_COST_XP = 40;
export const HINT_MAX_STACK = 3;

// Hearts are a global pool (not per-task/module): a wrong quiz answer anywhere costs one, and at
// 0 hearts no further question can be attempted until at least one regenerates. The max is fixed;
// only the refill interval is admin-editable (see AppSettings / the admin settings route), and
// this value is just the fallback used until an admin ever saves a setting.
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
