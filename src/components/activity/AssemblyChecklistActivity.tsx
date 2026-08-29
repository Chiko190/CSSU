"use client";

import { useState } from "react";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { AssemblyScene, type AssemblyStep } from "@/3d/AssemblyScene";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

function toStep(item: ProcedureChecklistItem): AssemblyStep | null {
  if (!item.model || !item.dragTarget) return null;
  return {
    itemId: item.id,
    url: item.model.url,
    label: item.label,
    phase: item.id.startsWith("remove-") ? "remove" : "install",
    installedPosition: item.dragTarget.installedPosition,
    trayPosition: item.dragTarget.trayPosition,
  };
}

/** Module 1, Task 1 ("Computer Disassembly and Assembly") -- the one task that's genuinely
 * about physical parts, so its steps with a dragTarget render as one persistent 3D scene the
 * learner drags parts around in, instead of a flat click-to-check list. */
export function AssemblyChecklistActivity({
  moduleId,
  items,
  initialCheckedIds,
}: {
  moduleId: string;
  items: ProcedureChecklistItem[];
  initialCheckedIds: string[];
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialCheckedIds));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const steps = items.map(toStep).filter((s): s is AssemblyStep => s !== null);
  const allChecked = checkedIds.size === items.length;
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const activeItem = items[nextIndex];
  const activeItemId = activeItem?.dragTarget ? activeItem.id : null;

  function handleCheck(id: string, index: number) {
    if (index !== nextIndex || checkedIds.has(id)) return;
    setSaved(false);
    setCheckedIds((prev) => new Set(prev).add(id));
  }

  function handleStepComplete(itemId: string) {
    setSaved(false);
    setCheckedIds((prev) => new Set(prev).add(itemId));
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/activities/${moduleId}/complete`, {
        method: "POST",
        body: JSON.stringify({ foundTargetIds: Array.from(checkedIds) }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lg:flex lg:flex-col lg:h-[calc(100vh-180px)] lg:min-h-[420px] gap-3">
      {/* On large screens this whole block is capped to the viewport height --
       * the 3D panel fills its column, the step list scrolls inside its own
       * card, and nothing pushes the page itself into scrolling. Stacks and
       * flows normally (no fixed heights) on smaller screens. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:flex-1 lg:min-h-0">
        <Card className="p-0 overflow-hidden lg:flex lg:flex-col lg:min-h-0">
          <div className="relative w-full h-[360px] sm:h-[440px] lg:h-auto lg:flex-1 lg:min-h-0 bg-bg-elevated">
            <AssemblyScene steps={steps} completedItemIds={checkedIds} activeItemId={activeItemId} onStepComplete={handleStepComplete} />
          </div>
          <p className="lg:shrink-0 px-4 py-2 text-xs text-text-muted border-t border-border-soft">
            {activeItemId
              ? "Drag the highlighted part to the marked spot."
              : "Complete the checklist steps to continue."}
          </p>
        </Card>

        <Card className="p-5 lg:overflow-y-auto lg:min-h-0">
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
                    onClick={() => !isDragStep && handleCheck(item.id, index)}
                    disabled={!isNext || isDragStep}
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
                        <span className="block text-xs text-primary mt-0.5">Use the 3D scene to do this step.</span>
                      )}
                      {locked && <span className="block text-xs text-text-faint mt-0.5">Complete the steps above first.</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <div className="lg:shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="space-y-1">
          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && !error && <p className="text-sm text-success">Progress saved.</p>}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!allChecked || submitting}>
            {submitting ? "Saving..." : allChecked ? "Mark Task Complete" : `Complete all ${items.length} steps to continue`}
          </Button>
        </div>
      </div>
    </div>
  );
}
