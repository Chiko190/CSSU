"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { AssemblyScene, type AssemblyStep } from "@/3d/AssemblyScene";
import { Button } from "@/components/ui/Button";
import { DialogueFeedback, DialogueHeader } from "@/components/game/GameUi";
import { apiFetch } from "@/lib/fetcher";
import { ChecklistComplete, ChecklistFrame, StepList } from "./ChecklistUi";
import { useChecklistProgress } from "./useChecklistProgress";

/** Converts a checklist item with a model+dragTarget into the 3D scene's own step shape --
 * shared with the quiz's practical check (see PracticalCheckActivity), which reuses this same
 * ProcedureChecklistItem content shape. */
export function toStep(item: ProcedureChecklistItem): AssemblyStep | null {
  if (!item.model || !item.dragTarget) return null;
  return {
    itemId: item.id,
    url: item.model.url,
    label: item.label,
    phase: item.id.startsWith("remove-") ? "remove" : "install",
    installedPosition: item.dragTarget.installedPosition,
    trayPosition: item.dragTarget.trayPosition,
    hiddenUntilItemId: item.dragTarget.hiddenUntilItemId,
  };
}

/** Module 1, Task 1 ("Computer Disassembly and Assembly") -- the one task that's genuinely about
 * physical parts, so its steps with a dragTarget play out in one persistent 3D case (full-width on
 * the frame's stage) and the dialogue box names the part to press next. Steps without a part (OH&S,
 * power on/off) get a "Done" button instead. Each step saves as it's checked. */
export function AssemblyChecklistActivity({
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
  const [wrong, setWrong] = useState<{ text: string; n: number } | null>(null);

  const steps = items.map(toStep).filter((s): s is AssemblyStep => s !== null);
  const doneCount = items.filter((i) => checkedIds.has(i.id)).length;
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const current = nextIndex === -1 ? null : items[nextIndex];
  const activeItemId = current?.dragTarget ? current.id : null;
  const removing = current?.id.startsWith("remove-") ?? false;

  function complete(id: string) {
    setWrong(null);
    markChecked(id);
  }

  // Pressing the wrong part (not the highlighted one) costs a heart, same as a wrong quiz answer --
  // the one place in the hands-on task where a mistake is actually possible.
  async function handleWrongPress() {
    let text = "Not that part yet -- look for the highlighted one.";
    try {
      const result = await apiFetch<{ ok: boolean }>("/api/hearts/lose", { method: "POST" });
      text = result.ok
        ? "💔 Not that part yet -- you lost a heart. Press the highlighted one."
        : "You're out of hearts -- they refill over time. Press the highlighted part.";
      // The header's heart count is server-rendered and wouldn't otherwise pick this up.
      router.refresh();
    } catch {
      // Keep the default message.
    }
    setWrong((prev) => ({ text, n: (prev?.n ?? 0) + 1 }));
  }

  async function handleContinue() {
    setLeaving(true);
    if (await flush()) {
      router.push(completionHref);
      router.refresh();
    } else {
      setLeaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <ChecklistFrame
        done={doneCount}
        total={items.length}
        saveState={saveState}
        stage={
          <div className="relative h-[360px] sm:h-[440px] w-full">
            <AssemblyScene
              steps={steps}
              completedItemIds={checkedIds}
              activeItemId={activeItemId}
              onStepComplete={complete}
              onWrongPress={handleWrongPress}
            />
          </div>
        }
      >
        {current ? (
          <div className="space-y-3">
            <DialogueHeader
              icon={current.dragTarget ? (removing ? "🪛" : "🔧") : "📋"}
              speaker={current.dragTarget ? (removing ? "Teardown" : "Rebuild") : "Workbench"}
              meta={`step ${nextIndex + 1} of ${items.length}`}
              line={current.label}
            />
            <p className="pl-14 text-sm text-text-muted">{current.explanation}</p>
            {current.dragTarget ? (
              <p className="pl-14 text-xs font-semibold text-primary">
                👆 Press the highlighted part in the 3D case (or hit Enter / Space). Drag to rotate the view.
              </p>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => complete(current.id)}>✓ Done, next step</Button>
              </div>
            )}
            <DialogueFeedback wrong={wrong?.text ?? null} lastExplain={null} shakeKey={wrong?.n} />
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
