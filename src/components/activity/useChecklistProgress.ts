"use client";

import { useCallback, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Checked-step state for a task checklist that saves after every step. Previously the steps were
 * only held in memory until "Mark Task Complete" at the very end, so leaving a 26-step task at step
 * 20 threw all of it away. The activity route already unions ids into the module's progress, so
 * each save just sends everything checked so far. Saves run through a serial queue so they land in
 * order; `flush()` waits for the queue (used before moving on to the quiz). */
export function useChecklistProgress(moduleId: string, initialCheckedIds: string[]) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(initialCheckedIds));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const latestRef = useRef<Set<string>>(new Set(initialCheckedIds));

  const save = useCallback(() => {
    setSaveState("saving");
    const ids = Array.from(latestRef.current);
    queueRef.current = queueRef.current.then(async () => {
      try {
        await apiFetch(`/api/activities/${moduleId}/complete`, {
          method: "POST",
          body: JSON.stringify({ foundTargetIds: ids }),
        });
        setSaveState("saved");
        setError(null);
        return true;
      } catch (err) {
        setSaveState("error");
        setError(err instanceof Error ? err.message : "Couldn't save -- your next step will retry.");
        return false;
      }
    });
    return queueRef.current;
  }, [moduleId]);

  const markChecked = useCallback(
    (id: string) => {
      if (latestRef.current.has(id)) return;
      latestRef.current = new Set(latestRef.current).add(id);
      setCheckedIds(latestRef.current);
      void save();
    },
    [save],
  );

  /** Resolves true once everything checked so far is saved (re-sending if the last save failed). */
  const flush = useCallback(async () => {
    const ok = await queueRef.current;
    return ok ? true : save();
  }, [save]);

  return { checkedIds, markChecked, saveState, error, flush };
}
