import { randomUUID } from "node:crypto";
import { getDataStore } from "@/core/data/store";
import type { XpEvent } from "@/core/data/types";
import { HINT_COST_XP, HINT_MAX_STACK } from "./constants";
import { getOrCreateProgress } from "./completion";

/** A hint's cost is spent from the same XP ledger that decides level -- it's not a
 * separate currency, so it can't be farmed independently of real progress. A held
 * charge is just the (purchases - uses) difference in that ledger. */
function balanceFromEvents(events: XpEvent[]): number {
  const purchased = events.filter((e) => e.type === "hint_purchase").length;
  const used = events.filter((e) => e.type === "hint_used").length;
  return Math.max(0, Math.min(HINT_MAX_STACK, purchased - used));
}

function totalXpFromEvents(events: XpEvent[]): number {
  return events.reduce((sum, e) => sum + e.amount, 0);
}

export async function getHintBalance(uid: string): Promise<number> {
  const store = getDataStore();
  return balanceFromEvents(await store.listXpEvents(uid));
}

export type BuyHintResult =
  | { ok: true; balance: number; totalXp: number }
  | { ok: false; error: string };

/** Spends HINT_COST_XP to bank one hint charge, up to HINT_MAX_STACK held at once. The
 * balance/XP check and the write happen atomically (recordXpEventIfAllowed re-reads the
 * ledger inside the same transaction/serialized write) so two concurrent purchases can't
 * both slip past the cap or the XP-cost check against the same stale numbers. */
export async function buyHint(uid: string): Promise<BuyHintResult> {
  const store = getDataStore();
  let rejection: string | null = null;

  const event = await store.recordXpEventIfAllowed(uid, (events) => {
    const balance = balanceFromEvents(events);
    const totalXp = totalXpFromEvents(events);

    if (balance >= HINT_MAX_STACK) {
      rejection = `Hint stack is full (${HINT_MAX_STACK}/${HINT_MAX_STACK}).`;
      return null;
    }
    if (totalXp < HINT_COST_XP) {
      rejection = `Not enough XP -- hints cost ${HINT_COST_XP} XP, you have ${totalXp}.`;
      return null;
    }

    return {
      id: randomUUID(),
      uid,
      moduleId: "global",
      type: "hint_purchase",
      amount: -HINT_COST_XP,
      createdAt: Date.now(),
    };
  });

  if (!event) {
    return { ok: false, error: rejection ?? "Couldn't buy a hint." };
  }
  // Re-read post-write so the returned numbers reflect exactly what was just committed,
  // including anything else that landed concurrently.
  const events = await store.listXpEvents(uid);
  return { ok: true, balance: balanceFromEvents(events), totalXp: totalXpFromEvents(events) };
}

export type UseHintResult = { ok: true; balance: number } | { ok: false; error: string };

/** Consumes one banked hint charge for a specific quiz question -- but only the first
 * charge spent on the quiz attempt currently in progress. Without this cap, a learner
 * with spare XP could buy-use-buy-use their way through every question in one sitting;
 * the bank of up to HINT_MAX_STACK charges is for saving up across separate attempts,
 * not for stacking help within a single one. */
export async function consumeHint(uid: string, moduleId: string): Promise<UseHintResult> {
  const progress = await getOrCreateProgress(uid, moduleId);
  if (progress.hintUsedThisAttempt) {
    return { ok: false, error: "Only one hint per quiz attempt -- this resets on your next attempt." };
  }

  const store = getDataStore();
  let rejection: string | null = null;

  const event = await store.recordXpEventIfAllowed(uid, (events) => {
    if (balanceFromEvents(events) <= 0) {
      rejection = "No hint charges left -- buy more from your profile.";
      return null;
    }
    return {
      id: randomUUID(),
      uid,
      moduleId,
      type: "hint_used",
      amount: 0,
      createdAt: Date.now(),
    };
  });

  if (!event) {
    return { ok: false, error: rejection ?? "Couldn't use a hint." };
  }

  await store.upsertModuleProgress({ ...progress, hintUsedThisAttempt: true });

  const events = await store.listXpEvents(uid);
  return { ok: true, balance: balanceFromEvents(events) };
}
