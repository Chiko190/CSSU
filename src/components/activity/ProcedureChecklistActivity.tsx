"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcedureChecklistActivityContent } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

export function ProcedureChecklistActivity({
  moduleId,
  activity,
}: {
  moduleId: string;
  activity: ProcedureChecklistActivityContent;
}) {
  const router = useRouter();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = checkedIds.size === activity.items.length;
  // The next item unlocks only once every prior one is checked -- mirrors the
  // task sheet's own step ordering instead of letting the list be done in any order.
  const nextIndex = activity.items.findIndex((item) => !checkedIds.has(item.id));
  // Show whichever step the learner is actively looking at: the one they're
  // about to do, or -- once everything's checked -- the last one they did.
  const focusedItem = activity.items[nextIndex === -1 ? activity.items.length - 1 : nextIndex];

  function handleCheck(id: string, index: number) {
    if (index !== nextIndex || checkedIds.has(id)) return;
    setCheckedIds((prev) => new Set(prev).add(id));
  }

  async function handleComplete() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/activities/${moduleId}/complete`, {
        method: "POST",
        body: JSON.stringify({ foundTargetIds: Array.from(checkedIds) }),
      });
      router.push(`/modules/${moduleId}/check`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-sm text-text-muted">{activity.instructions}</p>
        <p className="mt-1 text-xs text-text-faint">
          {checkedIds.size} / {activity.items.length} steps completed
        </p>
      </Card>

      {focusedItem?.model && (
        <Card className="p-0 overflow-hidden">
          <div className="relative w-full h-[260px] sm:h-[320px] bg-bg-elevated">
            <PartViewer
              key={focusedItem.id}
              shape={{ kind: "model", url: focusedItem.model.url }}
              rotation={focusedItem.model.rotation}
            />
          </div>
          <p className="px-4 py-2 text-xs text-text-muted border-t border-border-soft">
            {focusedItem.label}
          </p>
        </Card>
      )}

      {!focusedItem?.model && focusedItem?.image && (
        <Card className="p-0 overflow-hidden">
          <div className="w-full bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element -- real screenshots, each with its own aspect ratio; no benefit from next/image here */}
            <img key={focusedItem.id} src={focusedItem.image.url} alt={focusedItem.image.alt} className="w-full h-auto block" />
          </div>
          <p className="px-4 py-2 text-xs text-text-muted border-t border-border-soft">
            {focusedItem.label}
          </p>
        </Card>
      )}

      <Card className="p-5">
        <ol className="space-y-2">
          {activity.items.map((item, index) => {
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
                      checked
                        ? "border-success bg-success text-white"
                        : "border-border text-text-faint"
                    }`}
                    aria-hidden
                  >
                    {checked ? <IconCheckCircle className="h-3 w-3" /> : index + 1}
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${checked ? "text-success" : "text-text"}`}>
                      {item.label}
                    </span>
                    {(checked || isNext) && (
                      <span className="block text-xs text-text-muted mt-0.5">{item.explanation}</span>
                    )}
                    {locked && <span className="block text-xs text-text-faint mt-0.5">Complete the steps above first.</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={!allChecked || submitting}>
          {submitting
            ? "Saving..."
            : allChecked
              ? "Complete Activity (+50 XP)"
              : `Complete all ${activity.items.length} steps to continue`}
        </Button>
      </div>
    </div>
  );
}
