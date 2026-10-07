"use client";

import { useState } from "react";
import type { WireOrderStep } from "@/core/content/types";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { WireOrderScene } from "@/3d/WireOrderScene";
import { useGameSession } from "@/components/game/useGameSession";
import { usePracticalProgress } from "@/components/game/usePracticalProgress";
import { DialogueFeedback, DialogueHeader, GameClearedCard, GameFrame, ProgressSegments } from "@/components/game/GameUi";

/** Task 1 quiz's practical check for Module 2 -- seat the cable's 8 wires into an RJ45 connector
 * in T568B order, one pin at a time, before the multiple-choice questions unlock. Laid out in the
 * shared GameFrame: the 3D connector full-width, then a dialogue box asking which wire goes in the
 * next pin, with a live pin row underneath. It's a recall test, so nothing gives the answer away:
 * the scene's tap label/cursor tells are off and unplaced pins show "?" rather than their color. */
export function WireOrderCheckActivity({
  moduleId,
  taskId,
  items,
  initialCheckedIds,
  initialHearts,
  onComplete,
}: {
  moduleId: string;
  taskId: string;
  items: WireOrderStep[];
  initialCheckedIds: string[];
  initialHearts: PublicHeartsState;
  /** Fires once the learner leaves the cleared screen -- the parent re-fetches server data so
   * the quiz questions take over. */
  onComplete: () => void;
}) {
  const game = useGameSession({ initialHearts, bestKey: `nc2:best:${moduleId}:${taskId}` });
  const { checkedIds, markChecked, persisting, error } = usePracticalProgress({ moduleId, taskId, initialCheckedIds });
  const [lastExplain, setLastExplain] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState(0);

  const nextIndex = items.findIndex((item) => !checkedIds.has(item.id));
  const allDone = nextIndex === -1;
  const activeItemId = items[nextIndex]?.id ?? null;
  const doneCount = items.filter((i) => checkedIds.has(i.id)).length;

  function handleStepComplete(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    markChecked(itemId);
    game.recordCorrect("Wire seated");
    setLastExplain(item ? `${item.label} -- ${item.explanation}` : null);
    setWrongKey(0);
    if (itemId === items[items.length - 1]?.id) game.finish();
  }

  function handleWrong() {
    setWrongKey((k) => k + 1);
    void game.recordMistake("Not that wire -- you lost a heart.");
  }

  if (allDone && game.result) {
    return <GameClearedCard result={game.result} onContinue={onComplete} busy={persisting} />;
  }

  return (
    <GameFrame
      title="Crimp a T568B Connector"
      progress={<ProgressSegments total={items.length} done={doneCount} label={`${doneCount}/${items.length} pins`} />}
      game={game}
      stage={
        <div className="relative h-[320px] sm:h-[380px] w-full">
          <WireOrderScene
            steps={items}
            completedItemIds={checkedIds}
            activeItemId={activeItemId}
            onStepComplete={handleStepComplete}
            onWrongPress={handleWrong}
            showHints={false}
          />
        </div>
      }
    >
      <div className="space-y-3">
        {allDone ? (
          <DialogueHeader icon="🔌" speaker="RJ45 connector" line="Every pin seated -- nice crimp!" />
        ) : (
          <DialogueHeader
            icon="🔌"
            speaker="RJ45 connector"
            meta={`T568B · pin ${nextIndex + 1} of ${items.length}`}
            line={
              <>
                Which wire goes in <span className="text-primary">pin {nextIndex + 1}</span>? Tap it in the tray.
              </>
            }
          />
        )}

        <PinRow items={items} checkedIds={checkedIds} activeIndex={nextIndex} />

        <DialogueFeedback
          wrong={
            wrongKey > 0
              ? `That's not the pin ${nextIndex + 1} wire. Think about which pair T568B starts with, and where the striped wires go.`
              : null
          }
          lastExplain={lastExplain}
          shakeKey={wrongKey}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {persisting && <p className="text-xs text-text-faint">Saving…</p>}
      </div>
    </GameFrame>
  );
}

/** The connector's 8 pins as a strip: placed pins show their wire's colors, the current pin glows,
 * the rest stay "?" so the strip never reveals the answer. */
function PinRow({ items, checkedIds, activeIndex }: { items: WireOrderStep[]; checkedIds: Set<string>; activeIndex: number }) {
  return (
    <ol className="grid grid-cols-8 gap-1.5" aria-label="Connector pins">
      {items.map((item, i) => {
        const placed = checkedIds.has(item.id);
        const active = i === activeIndex;
        return (
          <li key={item.id} className="flex flex-col items-center gap-1">
            <div
              aria-label={placed ? item.label : `Pin ${i + 1}: empty`}
              className={`flex h-10 w-full items-center justify-center overflow-hidden rounded-md border ${
                placed
                  ? "border-success/60 animate-game-pop"
                  : active
                    ? "border-primary bg-primary/10 shadow-[var(--shadow-glow-primary)] animate-pulse"
                    : "border-dashed border-border bg-surface-2"
              }`}
              style={
                placed
                  ? {
                      background: item.stripeColor
                        ? `repeating-linear-gradient(135deg, ${item.color} 0 6px, ${item.stripeColor} 6px 10px)`
                        : item.color,
                    }
                  : undefined
              }
            >
              {!placed && <span className={`text-sm font-bold ${active ? "text-primary" : "text-text-faint"}`}>?</span>}
            </div>
            <span className={`text-[10px] font-semibold font-mono-tabular ${active ? "text-primary" : placed ? "text-success" : "text-text-faint"}`}>
              {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
