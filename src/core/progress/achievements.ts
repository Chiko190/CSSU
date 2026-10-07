import type { UserModuleProgress, XpEvent } from "@/core/data/types";
import { LEVEL_NAMES } from "./constants";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  /** For badges earned gradually, e.g. "2/4" units -- shown while still locked. */
  progress?: string;
}

/** Signature badge per unit of competency, keyed by module id. */
const UNIT_BADGES: Record<string, { icon: string; title: string }> = {
  "module-1": { icon: "🖥️", title: "PC Technician" },
  "module-2": { icon: "🌐", title: "Network Builder" },
  "module-3": { icon: "🗄️", title: "Domain Admin" },
  "module-4": { icon: "💾", title: "Data Rescuer" },
};

/** Badges derived entirely from data the app already records (progress rows + XP events), so
 * there's nothing extra to store or migrate -- they're recomputed on every profile view, and
 * resetting progress naturally clears them. */
export function computeAchievements({
  progressRows,
  xpEvents,
  moduleIds,
  level,
}: {
  progressRows: UserModuleProgress[];
  xpEvents: XpEvent[];
  /** Every module, in order. */
  moduleIds: string[];
  level: number;
}): Achievement[] {
  const byModule = new Map(progressRows.map((p) => [p.moduleId, p]));
  const briefings = progressRows.filter((p) => p.lessonCompletedAt).length;
  const quizzesPassed = progressRows.reduce((n, p) => n + Object.values(p.taskQuizzes).filter((tq) => tq.passed).length, 0);
  const perfects = xpEvents.filter((e) => e.type === "quiz_perfect_bonus").length;
  const unitsDone = moduleIds.filter((id) => byModule.get(id)?.completedAt).length;
  const games = progressRows.reduce((n, p) => n + Object.keys(p.practicalCheckedIds).length, 0);

  return [
    {
      id: "first-briefing",
      icon: "📖",
      title: "Bookworm",
      description: "Finish a module briefing",
      earned: briefings > 0,
    },
    {
      id: "first-game",
      icon: "🎮",
      title: "Player One",
      description: "Start a practical-check game",
      earned: games > 0,
    },
    {
      id: "first-quiz",
      icon: "🧠",
      title: "Quick Study",
      description: "Pass your first task quiz",
      earned: quizzesPassed > 0,
    },
    {
      id: "perfect",
      icon: "🎯",
      title: "Sharpshooter",
      description: "Score 100% on a quiz",
      earned: perfects > 0,
    },
    {
      id: "five-perfect",
      icon: "💎",
      title: "Flawless",
      description: "Score 100% on 5 quizzes",
      earned: perfects >= 5,
      progress: `${Math.min(perfects, 5)}/5`,
    },
    ...moduleIds.map((id, i) => {
      const badge = UNIT_BADGES[id] ?? { icon: "🏅", title: `Unit ${i + 1}` };
      return {
        id: `unit-${id}`,
        icon: badge.icon,
        title: badge.title,
        description: `Complete UC ${i + 1}`,
        earned: Boolean(byModule.get(id)?.completedAt),
      };
    }),
    {
      id: "max-level",
      icon: "⭐",
      title: LEVEL_NAMES[LEVEL_NAMES.length - 1],
      description: `Reach level ${LEVEL_NAMES.length}`,
      earned: level >= LEVEL_NAMES.length,
      progress: `LVL ${level}`,
    },
    {
      id: "champion",
      icon: "🏆",
      title: "NC II Ready",
      description: "Complete all four units",
      earned: moduleIds.length > 0 && unitsDone === moduleIds.length,
      progress: `${unitsDone}/${moduleIds.length}`,
    },
  ];
}
