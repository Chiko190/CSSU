"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { AssemblyScene, type AssemblyStep } from "@/3d/AssemblyScene";
import { toStep } from "@/components/activity/AssemblyChecklistActivity";
import { Card } from "@/components/ui/Card";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

/** Task 1 quiz's practical check -- an unguided disassembly sequence (Panel, Motherboard, CPU,
 * RAM x2, ROM, CPU Cooler, Fan, Graphics Card, Hard Drive, PSU, then a Final Check) that gates
 * the multiple-choice questions on the same quiz page. Deliberately not guided the way the task
 * checklist's AssemblyChecklistActivity is: no "Tap to remove" label, no hover hint -- the
 * learner has to recognize each part on sight and click it directly, and pressing the wrong one
 * costs a heart just like a wrong quiz answer would. */
export function PracticalCheckActivity({
  moduleId,
  taskId,
  items,
  initialCheckedIds,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  items: ProcedureChecklistItem[];
  initialCheckedIds: string[];
  /** Fires once the very last item (Final Check) is confirmed and persisted -- the parent
   * re-fetches server data so the quiz questions take over. */
  onComplete: () => void;
}) {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialCheckedIds));
  const [persisting, setPersisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heartMessage, setHeartMessage] = useState<string | null>(null);

  const steps = items.map(toStep).filter((s): s is AssemblyStep => s !== null);
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const activeItem = items[nextIndex];
  const activeItemId = activeItem?.dragTarget ? activeItem.id : null;

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
      setError(err instanceof Error ? err.message : "Couldn't save progress -- try that step again");
      // Roll the optimistic check back so the learner can retry the same step.
      setCheckedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } finally {
      setPersisting(false);
    }
  }

  function markChecked(itemId: string) {
    setCheckedIds((prev) => new Set(prev).add(itemId));
    void persistStep(itemId);
  }

  function handleStepComplete(itemId: string) {
    markChecked(itemId);
  }

  function handleFinalCheckClick(id: string, index: number) {
    if (index !== nextIndex || checkedIds.has(id)) return;
    markChecked(id);
  }

  async function handleWrongPress() {
    try {
      const result = await apiFetch<{ ok: boolean }>("/api/hearts/lose", { method: "POST" });
      setHeartMessage(
        result.ok ? "❤️ Not that part -- you lost a heart." : "You're already out of hearts -- wait for one to refill.",
      );
      router.refresh();
    } catch {
      setHeartMessage("Not that part.");
    } finally {
      window.setTimeout(() => setHeartMessage(null), 3000);
    }
  }

  return (
    <div className="lg:flex lg:flex-col lg:h-[calc(100vh-260px)] lg:min-h-[420px] gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:flex-1 lg:min-h-0">
        <Card className="p-0 overflow-hidden lg:flex lg:flex-col lg:min-h-0">
          <div className="relative w-full h-[360px] sm:h-[440px] lg:h-auto lg:flex-1 lg:min-h-0 bg-bg-elevated">
            <AssemblyScene
              steps={steps}
              completedItemIds={checkedIds}
              activeItemId={activeItemId}
              onStepComplete={handleStepComplete}
              onWrongPress={handleWrongPress}
              showTapLabel={false}
              hintCorrectOnHover={false}
            />
          </div>
          <p
            className={`lg:shrink-0 px-4 py-2 text-xs border-t border-border-soft ${
              heartMessage ? "text-danger font-semibold" : "text-text-muted"
            }`}
          >
            {heartMessage ??
              (activeItemId
                ? "Click the part you think is next -- a wrong part costs a heart."
                : "Complete the checklist steps to continue.")}
          </p>
        </Card>

        <Card className="p-5 lg:overflow-y-auto lg:min-h-0">
          <p className="text-xs text-text-faint mb-3">
            Practical check -- remove every part in order before the quiz questions unlock.
          </p>
          <ol className="space-y-2">
            {items.map((item, index) => {
              const checked = checkedIds.has(item.id);
              const isNext = index === nextIndex;
              const locked = !checked && !isNext;
              const isDragStep = Boolean(item.dragTarget);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => !isDragStep && handleFinalCheckClick(item.id, index)}
                    disabled={!isNext || isDragStep || persisting}
                    aria-label={checked ? `${item.label} (done)` : `Step ${index + 1}: ${item.label}`}
                    className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors ${
                      checked
                        ? "border-success/40 bg-success/10"
                        : isNext
                          ? `border-primary/60 bg-primary/5 ${isDragStep ? "" : "hover:bg-primary/10 cursor-pointer"}`
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
                      {isNext && isDragStep && (
                        <span className="block text-xs text-primary mt-0.5">Find and click it in the 3D scene.</span>
                      )}
                      {isNext && !isDragStep && (
                        <span className="block text-xs text-primary mt-0.5">Click to confirm and unlock the quiz.</span>
                      )}
                      {locked && <span className="block text-xs text-text-faint mt-0.5">Complete the steps above first.</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
