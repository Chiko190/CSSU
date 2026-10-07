"use client";

import { useCallback, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";

/** Optimistic, persisted checked-ids state for a quiz-gating practical check. Saves go through a
 * serial queue: the server rejects out-of-order steps, so two quick taps must never race each
 * other to the API. A failed save rolls that id back so the learner can redo it. */
export function usePracticalProgress({
  moduleId,
  taskId,
  initialCheckedIds,
}: {
  moduleId: string;
  taskId: string;
  initialCheckedIds: string[];
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(initialCheckedIds));
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const markChecked = useCallback(
    (itemId: string) => {
      setCheckedIds((prev) => new Set(prev).add(itemId));
      setError(null);
      setPending((n) => n + 1);
      queueRef.current = queueRef.current.then(async () => {
        try {
          await apiFetch(`/api/practical-check/${moduleId}/${taskId}/complete`, {
            method: "POST",
            body: JSON.stringify({ itemId }),
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Couldn't save progress -- try that step again");
          setCheckedIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        } finally {
          setPending((n) => n - 1);
        }
      });
    },
    [moduleId, taskId],
  );

  return { checkedIds, markChecked, persisting: pending > 0, error };
}
