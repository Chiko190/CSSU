import { getDataStore } from "@/core/data/store";
import type { PointsState } from "@/core/data/types";
import { POINTS_PER_QUESTION, SKIP_COST_POINTS } from "./constants";

export interface PublicPointsState {
  balance: number;
  skipCost: number;
}

function toPublic(state: PointsState): PublicPointsState {
  return { balance: state.balance, skipCost: SKIP_COST_POINTS };
}

async function readState(uid: string): Promise<PointsState> {
  const existing = await getDataStore().getPointsState(uid);
  return existing ?? { uid, balance: 0, earnedQuestionKeys: [], updatedAt: Date.now() };
}

export function questionKey(moduleId: string, taskId: string, questionId: string): string {
  return `${moduleId}:${taskId}:${questionId}`;
}

export async function getPoints(uid: string): Promise<PublicPointsState> {
  return toPublic(await readState(uid));
}

/** Pays out a question's point the first time it's ever answered correctly -- a no-op on every
 * later correct answer (including on a quiz retake), so points can't be farmed. */
export async function awardQuestionPoint(uid: string, key: string): Promise<PublicPointsState> {
  const state = await readState(uid);
  if (state.earnedQuestionKeys.includes(key)) return toPublic(state);
  const updated: PointsState = {
    ...state,
    balance: state.balance + POINTS_PER_QUESTION,
    earnedQuestionKeys: [...state.earnedQuestionKeys, key],
    updatedAt: Date.now(),
  };
  await getDataStore().upsertPointsState(updated);
  return toPublic(updated);
}

/** Spends SKIP_COST_POINTS, or returns ok: false (spending nothing) if the balance is short. */
export async function spendSkipPoints(uid: string): Promise<{ ok: boolean; points: PublicPointsState }> {
  const state = await readState(uid);
  if (state.balance < SKIP_COST_POINTS) return { ok: false, points: toPublic(state) };
  const updated: PointsState = { ...state, balance: state.balance - SKIP_COST_POINTS, updatedAt: Date.now() };
  await getDataStore().upsertPointsState(updated);
  return { ok: true, points: toPublic(updated) };
}
