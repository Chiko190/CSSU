"use client";

import { useEffect } from "react";
import type { PublicHeartsState } from "@/core/progress/hearts";

/** Re-fetches hearts when the next one is due, for as long as the pool is below max -- so a
 * refilled heart shows up on its own instead of the count sitting stale (or a countdown sitting at
 * 0:00). Re-armed after every fetch: if the server's clock is a little behind ours and the heart
 * hasn't landed yet, the fresh (unchanged) state schedules another try a second later. */
export function useHeartsRefill(hearts: PublicHeartsState, refresh: () => void | Promise<void>) {
  useEffect(() => {
    if (hearts.current >= hearts.max || hearts.nextRefillAt === null) return;
    const delay = Math.max(1000, hearts.nextRefillAt - Date.now() + 250);
    const id = window.setTimeout(() => void refresh(), delay);
    return () => window.clearTimeout(id);
  }, [hearts, refresh]);
}
