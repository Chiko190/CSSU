"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Button } from "@/components/ui/Button";
import { DialogueHeader } from "@/components/game/GameUi";
import { ChecklistComplete, ChecklistFrame, StepList } from "./ChecklistUi";
import { useChecklistProgress } from "./useChecklistProgress";

/** The interactive step checklist for one task -- a scoped slice of its module's activity, in the
 * shared frame: the current step's 3D part or real screenshot on the stage, the step and its "why"
 * in the dialogue box with one big "Done" button (Enter works too), and every step listed below.
 * Each step saves as it's checked, so leaving partway keeps your place. */
export function TaskChecklistActivity({
  moduleId,
  items,
  initialCheckedIds,
  completionHref,
}: {
  moduleId: string;
  items: ProcedureChecklistItem[];
  initialCheckedIds: string[];
  /** Where finishing continues to -- this task's own quiz. */
  completionHref: string;
}) {
  const router = useRouter();
  const { checkedIds, markChecked, saveState, error, flush } = useChecklistProgress(moduleId, initialCheckedIds);
  const [leaving, setLeaving] = useState(false);

  const doneCount = items.filter((i) => checkedIds.has(i.id)).length;
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const allChecked = nextIndex === -1;
  const current = allChecked ? null : items[nextIndex];
  const shown = current ?? items[items.length - 1];

  async function handleContinue() {
    setLeaving(true);
    if (await flush()) {
      router.push(completionHref);
      router.refresh();
    } else {
      setLeaving(false);
    }
  }

  // Enter / Space checks off the current step -- quick to work through a long task sheet.
  useEffect(() => {
    if (!current) return;
    const id = current.id;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "BUTTON", "A"].includes(target.tagName)) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        markChecked(id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, markChecked]);

  const stage = shown?.model ? (
    <div className="h-[240px] sm:h-[300px]">
      <PartViewer key={shown.id} shape={{ kind: "model", url: shown.model.url }} rotation={shown.model.rotation} />
    </div>
  ) : shown?.image ? (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- real screenshots, each with its own aspect ratio */}
      <img key={shown.id} src={shown.image.url} alt={shown.image.alt} className="mx-auto block max-h-[320px] w-full object-contain animate-game-pop" />
      {shown.image.credit && <p className="px-4 pb-2 text-[11px] text-text-faint">{shown.image.credit}</p>}
    </div>
  ) : undefined;

  return (
    <div className="space-y-4">
      <ChecklistFrame done={doneCount} total={items.length} saveState={saveState} stage={stage}>
        {current ? (
          <div className="space-y-3">
            <DialogueHeader icon="📋" speaker={`Step ${nextIndex + 1} of ${items.length}`} meta="task sheet" line={current.label} />
            <p className="pl-14 text-sm text-text-muted">{current.explanation}</p>
            <div className="flex items-center justify-between gap-3">
              <span className="hidden sm:inline text-[11px] text-text-faint">Press Enter when you&apos;ve done it</span>
              <Button onClick={() => markChecked(current.id)} className="ml-auto">
                ✓ Done, next step
              </Button>
            </div>
          </div>
        ) : (
          <ChecklistComplete total={items.length} onContinue={handleContinue} busy={leaving} />
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </ChecklistFrame>

      <StepList items={items} checkedIds={checkedIds} nextIndex={nextIndex} />
    </div>
  );
}
