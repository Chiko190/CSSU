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

async function getHeartsMax(): Promise<number> {
  const settings = await getDataStore().getSettings();
  return settings.heartsMax && settings.heartsMax > 0 ? settings.heartsMax : HEARTS_MAX;
}

/** Applies however many intervals have elapsed since nextRefillAt to a stored hearts row,
 * capped at heartsMax -- the lazy-regen calc shared by every read and every consume, so hearts
 * "tick up" purely from wall-clock time with no cron job needed. */
function applyRegen(state: HeartsState, intervalMs: number, heartsMax: number, now: number): HeartsState {
  if (state.current >= heartsMax || state.nextRefillAt === null || now < state.nextRefillAt) {
    return state;
  }
  const elapsedIntervals = Math.floor((now - state.nextRefillAt) / intervalMs) + 1;
  const current = Math.min(heartsMax, state.current + elapsedIntervals);
  const nextRefillAt = current < heartsMax ? state.nextRefillAt + elapsedIntervals * intervalMs : null;
  return { ...state, current, nextRefillAt, updatedAt: now };
}

function toPublic(state: HeartsState, heartsMax: number): PublicHeartsState {
  return { current: state.current, max: heartsMax, nextRefillAt: state.nextRefillAt };
}

/** Reads (and persists, if regen happened) this user's up-to-date hearts state. Safe to call
 * on every page load -- doesn't consume anything. */
export async function getHearts(uid: string): Promise<PublicHeartsState> {
  const store = getDataStore();
  const [existing, intervalMs, heartsMax] = await Promise.all([
    store.getHeartsState(uid),
    getRefillIntervalMs(),
    getHeartsMax(),
  ]);
  const now = Date.now();
  const base: HeartsState = existing ?? { uid, current: heartsMax, nextRefillAt: null, updatedAt: now };
  const regenerated = applyRegen(base, intervalMs, heartsMax, now);
  if (regenerated !== base) {
    await store.upsertHeartsState(regenerated);
  } else if (!existing) {
    await store.upsertHeartsState(base);
  }
  return toPublic(regenerated, heartsMax);
}

export type LoseHeartResult =
  | { ok: true; hearts: PublicHeartsState }
  | { ok: false; hearts: PublicHeartsState };

/** Consumes one heart for a wrong quiz answer. Rejects (ok: false) if already at 0 after
 * catching up on regen -- callers must check for a heart before letting a question be attempted
 * at all, this is just the atomic decrement + the final guard against a race. */
export async function loseHeart(uid: string): Promise<LoseHeartResult> {
  const store = getDataStore();
  const [existing, intervalMs, heartsMax] = await Promise.all([
    store.getHeartsState(uid),
    getRefillIntervalMs(),
    getHeartsMax(),
  ]);
  const now = Date.now();
  const base: HeartsState = existing ?? { uid, current: heartsMax, nextRefillAt: null, updatedAt: now };
  const regenerated = applyRegen(base, intervalMs, heartsMax, now);

  if (regenerated.current <= 0) {
    if (regenerated !== base) await store.upsertHeartsState(regenerated);
    return { ok: false, hearts: toPublic(regenerated, heartsMax) };
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
  return { ok: true, hearts: toPublic(updated, heartsMax) };
}
