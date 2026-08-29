"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

/** The interactive step checklist for one task -- a scoped slice of its module's activity.
 * Submits only this task's item ids; the server unions progress across every task in the module. */
export function TaskChecklistActivity({
  moduleId,
  items,
  initialCheckedIds,
  isLastTask,
  completionHref,
}: {
  moduleId: string;
  items: ProcedureChecklistItem[];
  initialCheckedIds: string[];
  /** Whether this is the last task in the module -- changes the button's label to point at the
   * quiz instead of the next task. */
  isLastTask: boolean;
  /** Where "Mark Task Complete" continues to -- the next task, or the module's quiz if this was
   * the last one. */
  completionHref: string;
}) {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialCheckedIds));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const allChecked = checkedIds.size === items.length;
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const focusedItem = items[nextIndex === -1 ? items.length - 1 : nextIndex];

  function handleCheck(id: string, index: number) {
    if (index !== nextIndex || checkedIds.has(id)) return;
    setSaved(false);
    setCheckedIds((prev) => new Set(prev).add(id));
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
      router.push(completionHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {focusedItem?.model && (
        <Card className="p-0 overflow-hidden">
          <div className="relative w-full h-[260px] sm:h-[320px] bg-bg-elevated">
            <PartViewer key={focusedItem.id} shape={{ kind: "model", url: focusedItem.model.url }} rotation={focusedItem.model.rotation} />
          </div>
          <p className="px-4 py-2 text-xs text-text-muted border-t border-border-soft">{focusedItem.label}</p>
        </Card>
      )}

      <Card className="p-5">
        <ol className="space-y-2">
          {items.map((item, index) => {
            const checked = checkedIds.has(item.id);
            const isNext = index === nextIndex;
            const locked = !checked && !isNext;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleCheck(item.id, index)}
                  disabled={!isNext}
                  aria-label={checked ? `${item.label} (done)` : `Step ${index + 1}: ${item.label}`}
                  className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-[var(--radius-md)] border transition-colors ${
                    checked
                      ? "border-success/40 bg-success/10"
                      : isNext
                        ? "border-primary/60 bg-primary/5 hover:bg-primary/10 cursor-pointer"
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
                    {locked && <span className="block text-xs text-text-faint mt-0.5">Complete the steps above first.</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && <p className="text-sm text-success">Progress saved.</p>}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!allChecked || submitting}>
          {submitting
            ? "Saving..."
            : allChecked
              ? isLastTask
                ? "Mark Task Complete & Take the Quiz"
                : "Mark Task Complete & Continue"
              : `Complete all ${items.length} steps to continue`}
        </Button>
      </div>
    </div>
  );
}
