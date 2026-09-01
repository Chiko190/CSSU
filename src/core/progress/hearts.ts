import { getDataStore } from "@/core/data/store";
import type { HeartsState } from "@/core/data/types";
import { HEARTS_MAX, DEFAULT_HEART_REFILL_INTERVAL_MS } from "./constants";

export interface PublicHeartsState {
  current: number;
  max: number;
  nextRefillAt: number | null;
}

async function getRefillIntervalMs(): Promise<number> {
  const settings = await getDataStore().getSettings();
  return settings.heartRefillIntervalMs > 0 ? settings.heartRefillIntervalMs : DEFAULT_HEART_REFILL_INTERVAL_MS;
}

/** Applies however many intervals have elapsed since nextRefillAt to a stored hearts row,
 * capped at HEARTS_MAX -- the lazy-regen calc shared by every read and every consume, so hearts
 * "tick up" purely from wall-clock time with no cron job needed. */
function applyRegen(state: HeartsState, intervalMs: number, now: number): HeartsState {
  if (state.current >= HEARTS_MAX || state.nextRefillAt === null || now < state.nextRefillAt) {
    return state;
  }
  const elapsedIntervals = Math.floor((now - state.nextRefillAt) / intervalMs) + 1;
  const current = Math.min(HEARTS_MAX, state.current + elapsedIntervals);
  const nextRefillAt = current < HEARTS_MAX ? state.nextRefillAt + elapsedIntervals * intervalMs : null;
  return { ...state, current, nextRefillAt, updatedAt: now };
}

function toPublic(state: HeartsState): PublicHeartsState {
  return { current: state.current, max: HEARTS_MAX, nextRefillAt: state.nextRefillAt };
}

/** Reads (and persists, if regen happened) this user's up-to-date hearts state. Safe to call
 * on every page load -- doesn't consume anything. */
export async function getHearts(uid: string): Promise<PublicHeartsState> {
  const store = getDataStore();
  const [existing, intervalMs] = await Promise.all([store.getHeartsState(uid), getRefillIntervalMs()]);
  const now = Date.now();
  const base: HeartsState = existing ?? { uid, current: HEARTS_MAX, nextRefillAt: null, updatedAt: now };
  const regenerated = applyRegen(base, intervalMs, now);
  if (regenerated !== base) {
    await store.upsertHeartsState(regenerated);
  } else if (!existing) {
    await store.upsertHeartsState(base);
  }
  return toPublic(regenerated);
}

export type LoseHeartResult =
  | { ok: true; hearts: PublicHeartsState }
  | { ok: false; hearts: PublicHeartsState };

/** Consumes one heart for a wrong quiz answer. Rejects (ok: false) if already at 0 after
 * catching up on regen -- callers must check for a heart before letting a question be attempted
 * at all, this is just the atomic decrement + the final guard against a race. */
export async function loseHeart(uid: string): Promise<LoseHeartResult> {
  const store = getDataStore();
  const [existing, intervalMs] = await Promise.all([store.getHeartsState(uid), getRefillIntervalMs()]);
  const now = Date.now();
  const base: HeartsState = existing ?? { uid, current: HEARTS_MAX, nextRefillAt: null, updatedAt: now };
  const regenerated = applyRegen(base, intervalMs, now);

  if (regenerated.current <= 0) {
    if (regenerated !== base) await store.upsertHeartsState(regenerated);
    return { ok: false, hearts: toPublic(regenerated) };
  }

  const updated: HeartsState = {
    uid,
    current: regenerated.current - 1,
    // Starts the drip timer the moment hearts first drop below max; if it's already running
    // (mid-regen), leave it ticking on its own schedule rather than resetting the clock.
    nextRefillAt: regenerated.nextRefillAt ?? now + intervalMs,
    updatedAt: now,
  };
  await store.upsertHeartsState(updated);
  return { ok: true, hearts: toPublic(updated) };
}
