"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WireOrderStep } from "@/core/content/types";
import { WireOrderScene } from "@/3d/WireOrderScene";
import { Card } from "@/components/ui/Card";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

/** Task 1 quiz's practical check for Module 2 -- fan the cable's 8 wires out and seat them into
 * an RJ45 connector in the correct T568B pin order, one at a time, before the multiple-choice
 * questions unlock. Same gating/persistence shape as PracticalCheckActivity (module-1's PC
 * teardown), just driven by WireOrderScene instead of AssemblyScene. */
export function WireOrderCheckActivity({
  moduleId,
  taskId,
  items,
  initialCheckedIds,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  items: WireOrderStep[];
  initialCheckedIds: string[];
  /** Fires once the last wire is seated and persisted -- the parent re-fetches server data so
   * the quiz questions take over. */
  onComplete: () => void;
}) {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialCheckedIds));
  const [persisting, setPersisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heartMessage, setHeartMessage] = useState<string | null>(null);

  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const activeItem = items[nextIndex];
  const activeItemId = activeItem?.id ?? null;

  async function persistStep(itemId: string) {
    setPersisting(true);
    setError(null);
    try {
      await apiFetch(`/api/practical-check/${moduleId}/${taskId}/complete`, {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
      if (itemId === items[items.length - 1]?.id) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save progress -- try that wire again");
      setCheckedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } finally {
      setPersisting(false);
    }
  }

  function handleStepComplete(itemId: string) {
    setCheckedIds((prev) => new Set(prev).add(itemId));
    void persistStep(itemId);
  }

  async function handleWrongPress() {
    try {
      const result = await apiFetch<{ ok: boolean }>("/api/hearts/lose", { method: "POST" });
      setHeartMessage(
        result.ok ? "❤️ Not that wire -- you lost a heart." : "You're already out of hearts -- wait for one to refill.",
      );
      router.refresh();
    } catch {
      setHeartMessage("Not that wire.");
    } finally {
      window.setTimeout(() => setHeartMessage(null), 3000);
    }
  }

  return (
    <div className="lg:flex lg:flex-col lg:h-[calc(100vh-260px)] lg:min-h-[420px] gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:flex-1 lg:min-h-0">
        <Card className="p-0 overflow-hidden lg:flex lg:flex-col lg:min-h-0">
          <div className="relative w-full h-[420px] sm:h-[460px] lg:h-auto lg:flex-1 lg:min-h-0 bg-bg-elevated">
            <WireOrderScene
              steps={items}
              completedItemIds={checkedIds}
              activeItemId={activeItemId}
              onStepComplete={handleStepComplete}
              onWrongPress={handleWrongPress}
            />
          </div>
          <p
            className={`lg:shrink-0 px-4 py-2 text-xs border-t border-border-soft ${
              heartMessage ? "text-danger font-semibold" : "text-text-muted"
            }`}
          >
            {heartMessage ??
              (activeItemId
                ? "🎨 Drag the highlighted wire into its pin slot -- a wrong wire costs a heart."
                : "Complete every pin to continue.")}
          </p>
        </Card>

        <Card className="p-5 lg:overflow-y-auto lg:min-h-0">
          <p className="text-xs text-text-faint mb-3">
            Practical check -- seat all 8 wires in T568B order before the quiz questions unlock.
          </p>
          <ol className="space-y-2">
            {items.map((item, index) => {
              const checked = checkedIds.has(item.id);
              const isNext = index === nextIndex;
              const locked = !checked && !isNext;
              return (
                <li key={item.id}>
                  <div
                    aria-label={checked ? `${item.label} (done)` : `Step ${index + 1}: ${item.label}`}
                    className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-[var(--radius-md)] border ${
                      checked
                        ? "border-success/40 bg-success/10"
                        : isNext
                          ? "border-primary/60 bg-primary/5"
                          : "border-border bg-surface opacity-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full border text-xs font-semibold ${
                        checked ? "border-success bg-success text-white" : "border-border text-text-faint"
                      }`}
                      aria-hidden
                    >
                      {checked ? <IconCheckCircle className="h-3 w-3" /> : index + 1}
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${checked ? "text-success" : "text-text"}`}>{item.label}</span>
                      {(checked || isNext) && <span className="block text-xs text-text-muted mt-0.5">{item.explanation}</span>}
                      {isNext && <span className="block text-xs text-primary mt-0.5">Find and tap it in the 3D scene.</span>}
                      {locked && <span className="block text-xs text-text-faint mt-0.5">Complete the pins above first.</span>}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          {persisting && <p className="mt-2 text-xs text-text-faint">Saving…</p>}
        </Card>
      </div>
    </div>
  );
}
