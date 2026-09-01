import { getDataStore } from "@/core/data/store";
import type { XpEvent, XpEventType } from "@/core/data/types";
import { LEVELS } from "./constants";

/** taskId is included for quiz_pass/quiz_perfect_bonus -- each task now has its own quiz, so those
 * types need a dedupe key scoped per-task, not just per-module. */
export function xpDedupeKey(uid: string, moduleId: string, type: XpEventType, taskId?: string): string {
  return taskId ? `${uid}:${moduleId}:${taskId}:${type}` : `${uid}:${moduleId}:${type}`;
}

/**
 * Idempotent XP award. Returns the event if this was a new award, or null if
 * an event with the same dedupe key already existed -- guarding against
 * duplicate XP from refreshes/resubmissions/retries.
 */
export async function awardXp(params: {
  uid: string;
  moduleId: string;
  taskId?: string;
  type: XpEventType;
  amount: number;
}): Promise<XpEvent | null> {
  const store = getDataStore();
  const event: XpEvent = {
    id: xpDedupeKey(params.uid, params.moduleId, params.type, params.taskId),
    uid: params.uid,
    moduleId: params.moduleId,
    type: params.type,
    amount: params.amount,
    createdAt: Date.now(),
  };
  const written = await store.recordXpEvent(event);
  return written ? event : null;
}

export async function getTotalXp(uid: string): Promise<number> {
  const store = getDataStore();
  const events = await store.listXpEvents(uid);
  return events.reduce((sum, e) => sum + e.amount, 0);
}

export interface LevelInfo {
  level: number;
  name: string;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelMinXp: number | null;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressPct: number;
}

export function computeLevel(totalXp: number): LevelInfo {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXp >= lvl.minXp) current = lvl;
    else break;
  }
  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;

  const xpIntoLevel = totalXp - current.minXp;
  const xpForNextLevel = next ? next.minXp - current.minXp : null;
  const progressPct = xpForNextLevel
    ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
    : 100;

  return {
    level: current.level,
    name: current.name,
    totalXp,
    currentLevelMinXp: current.minXp,
    nextLevelMinXp: next?.minXp ?? null,
    xpIntoLevel,
    xpForNextLevel,
    progressPct,
  };
}
