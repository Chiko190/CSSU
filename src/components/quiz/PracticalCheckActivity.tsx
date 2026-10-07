"use client";

import { useState } from "react";
import type { ProcedureChecklistItem } from "@/core/content/types";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { AssemblyScene, type AssemblyStep } from "@/3d/AssemblyScene";
import { toStep } from "@/components/activity/AssemblyChecklistActivity";
import { Button } from "@/components/ui/Button";
import { useGameSession } from "@/components/game/useGameSession";
import { usePracticalProgress } from "@/components/game/usePracticalProgress";
import { DialogueFeedback, DialogueHeader, GameClearedCard, GameFrame, ProgressSegments } from "@/components/game/GameUi";

/** Task 1 quiz's practical check -- an unguided teardown then rebuild of the PC that gates the
 * multiple-choice questions on the same quiz page. Deliberately not guided the way the task
 * checklist's AssemblyChecklistActivity is: no "Tap to remove" label, no hover hint -- the learner
 * has to recognize each part on sight and click it directly, and pressing the wrong one costs a
 * heart. Laid out in the shared GameFrame: the 3D case full-width, then a dialogue box naming the
 * part to find next (or the final confirm button). */
export function PracticalCheckActivity({
  moduleId,
  taskId,
  items,
  initialCheckedIds,
  initialHearts,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  items: ProcedureChecklistItem[];
  initialCheckedIds: string[];
  initialHearts: PublicHeartsState;
  /** Fires once the learner leaves the cleared screen -- the parent re-fetches server data so the
   * quiz questions take over. */
  onComplete: () => void;
}) {
  const game = useGameSession({ initialHearts, bestKey: `nc2:best:${moduleId}:${taskId}` });
  const { checkedIds, markChecked, persisting, error } = usePracticalProgress({ moduleId, taskId, initialCheckedIds });
  const [lastExplain, setLastExplain] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState(0);

  const steps = items.map(toStep).filter((s): s is AssemblyStep => s !== null);
  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const allDone = nextIndex === -1;
  const activeItem = allDone ? null : items[nextIndex];
  const activeItemId = activeItem?.dragTarget ? activeItem.id : null;
  const doneCount = items.filter((i) => checkedIds.has(i.id)).length;
  const removing = activeItem?.id.startsWith("remove-") ?? false;

  function complete(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    markChecked(itemId);
    game.recordCorrect("Correct part");
    setLastExplain(item ? `${item.label} -- ${item.explanation}` : null);
    setWrongKey(0);
    if (itemId === items[items.length - 1]?.id) game.finish();
  }

  function handleWrong() {
    setWrongKey((k) => k + 1);
    void game.recordMistake("Not that part -- you lost a heart.");
  }

  if (allDone && game.result) {
    return <GameClearedCard result={game.result} onContinue={onComplete} busy={persisting} />;
  }

  return (
    <GameFrame
      title="Strip It, Rebuild It"
      progress={<ProgressSegments total={items.length} done={doneCount} />}
      game={game}
      stage={
        <div className="relative h-[340px] sm:h-[400px] w-full">
          <AssemblyScene
            steps={steps}
            completedItemIds={checkedIds}
            activeItemId={activeItemId}
            onStepComplete={complete}
            onWrongPress={handleWrong}
            showTapLabel={false}
            hintCorrectOnHover={false}
          />
        </div>
      }
    >
      <div className="space-y-3">
        {!activeItem ? (
          <DialogueHeader icon="🧰" speaker="Workbench" line="Every part done -- the PC is rebuilt!" />
        ) : (
          <DialogueHeader
            icon={removing ? "🪛" : "🔧"}
            speaker={removing ? "Teardown" : "Rebuild"}
            meta={`step ${nextIndex + 1} of ${items.length}`}
            line={activeItem.label}
          />
        )}

        {activeItem && activeItem.dragTarget && (
          <p className="text-xs text-text-muted">
            Find it in the 3D case and click it. No hints this time -- a wrong part costs a ❤️. Chain correct parts for a 🔥 combo.
          </p>
        )}
        {activeItem && !activeItem.dragTarget && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-text-muted">{activeItem.explanation}</p>
            <Button onClick={() => complete(activeItem.id)} disabled={persisting || game.outOfHearts}>
              ✓ Confirm
            </Button>
          </div>
        )}

        <DialogueFeedback
          wrong={wrongKey > 0 ? `That's not the part for "${activeItem?.label ?? ""}". Look again -- rotate the case if you need to.` : null}
          lastExplain={lastExplain}
          shakeKey={wrongKey}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {persisting && <p className="text-xs text-text-faint">Saving…</p>}
      </div>
    </GameFrame>
  );
}
