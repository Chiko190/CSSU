"use client";

import { useState } from "react";
import type { WireOrderStep, WiringStandard } from "@/core/content/types";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { WireOrderScene } from "@/3d/WireOrderScene";
import { useGameSession } from "@/components/game/useGameSession";
import { usePracticalProgress } from "@/components/game/usePracticalProgress";
import { DialogueFeedback, DialogueHeader, GameClearedCard, GameFrame, ProgressSegments } from "@/components/game/GameUi";

/** Task 1 quiz's practical check for Module 2 -- drag the cable's 8 wires into an RJ45 connector,
 * once wired T568A and once wired T568B, before the multiple-choice questions unlock. Laid out in
 * the shared GameFrame: the 3D connector full-width, then a dialogue box naming the standard being
 * wired, with a live pin row underneath. It's a recall test, so nothing gives the answer away:
 * unplaced pins show "?" rather than their color. */
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
  const [wrong, setWrong] = useState<{ key: number; text: string } | null>(null);

  // Rounds in the order they first appear in `items` (T568A, then T568B).
  const standards = Array.from(new Set(items.map((i) => i.standard)));
  const currentStandard: WiringStandard | null =
    standards.find((s) => items.some((i) => i.standard === s && !checkedIds.has(i.id))) ?? null;
  const allDone = currentStandard === null;
  const shownStandard = currentStandard ?? standards[standards.length - 1];
  const roundItems = items.filter((i) => i.standard === shownStandard);
  const roundNumber = standards.indexOf(shownStandard) + 1;
  const roundDone = roundItems.filter((i) => checkedIds.has(i.id)).length;
  const doneCount = items.filter((i) => checkedIds.has(i.id)).length;
  const previousStandard = roundNumber > 1 && roundDone === 0 ? standards[roundNumber - 2] : null;

  function handleStepComplete(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    markChecked(itemId);
    game.recordCorrect("Wire seated");
    setLastExplain(item ? `${item.standard} ${item.label} -- ${item.explanation}` : null);
    setWrong(null);
    const remaining = items.filter((i) => !checkedIds.has(i.id) && i.id !== itemId);
    if (remaining.length === 0) game.finish();
  }

  function handleWrongDrop(itemId: string, pinIndex: number) {
    const item = items.find((i) => i.id === itemId);
    const wireName = item?.label.split(": ")[1] ?? "That wire";
    setWrong((w) => ({
      key: (w?.key ?? 0) + 1,
      text: `${wireName} doesn't go in pin ${pinIndex + 1} for ${shownStandard}. Think about which pair ${shownStandard} starts with, and where the striped wires go.`,
    }));
    void game.recordMistake("Wrong pin -- you lost a heart.");
  }

  if (allDone && game.result) {
    return <GameClearedCard result={game.result} onContinue={onComplete} busy={persisting} />;
  }

  return (
    <GameFrame
      title="Crimp T568A & T568B Connectors"
      progress={<ProgressSegments total={items.length} done={doneCount} label={`${doneCount}/${items.length} pins`} />}
      game={game}
      stage={
        <div className="relative h-[320px] sm:h-[380px] w-full">
          <StandardTabs standards={standards} current={shownStandard} items={items} checkedIds={checkedIds} />
          <WireOrderScene
            // A fresh scene per connector, so the second round starts with all 8 wires back in the tray.
            key={shownStandard}
            steps={roundItems}
            completedItemIds={checkedIds}
            interactive={!allDone}
            onStepComplete={handleStepComplete}
            onWrongDrop={handleWrongDrop}
          />
        </div>
      }
    >
      <div className="space-y-3">
        {allDone ? (
          <DialogueHeader icon="🔌" speaker="RJ45 connector" line="Both connectors wired -- nice crimp!" />
        ) : (
          <DialogueHeader
            icon="🔌"
            speaker="RJ45 connector"
            meta={`Connector ${roundNumber} of ${standards.length} · ${roundDone}/${roundItems.length} pins`}
            line={
              <>
                {previousStandard && <>{previousStandard} done! Now the other color code. </>}
                Wire this connector in <span className="text-primary">{shownStandard}</span>. Drag each wire from the tray
                onto its pin (or tap a wire, then tap its pin) -- pin 1 is on the left.
              </>
            }
          />
        )}

        <PinRow items={roundItems} checkedIds={checkedIds} />

        <DialogueFeedback wrong={wrong?.text ?? null} lastExplain={lastExplain} shakeKey={wrong?.key ?? 0} />
        {error && <p className="text-sm text-danger">{error}</p>}
        {persisting && <p className="text-xs text-text-faint">Saving…</p>}
      </div>
    </GameFrame>
  );
}

/** Small badges over the scene showing both connectors: which one is being wired, which is done. */
function StandardTabs({
  standards,
  current,
  items,
  checkedIds,
}: {
  standards: WiringStandard[];
  current: WiringStandard;
  items: WireOrderStep[];
  checkedIds: Set<string>;
}) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-1.5">
      {standards.map((s) => {
        const done = items.filter((i) => i.standard === s).every((i) => checkedIds.has(i.id));
        const active = s === current && !done;
        return (
          <span
            key={s}
            className={`rounded-full border px-2.5 py-1 font-mono-tabular text-[11px] font-bold ${
              done
                ? "border-success/60 bg-success/15 text-success"
                : active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-text-faint"
            }`}
          >
            {done ? "✓ " : ""}
            {s}
          </span>
        );
      })}
    </div>
  );
}

/** The connector's 8 pins as a strip: placed pins show their wire's colors, the rest stay "?" so
 * the strip never reveals the answer. */
function PinRow({ items, checkedIds }: { items: WireOrderStep[]; checkedIds: Set<string> }) {
  return (
    <ol className="grid grid-cols-8 gap-1.5" aria-label="Connector pins">
      {items.map((item, i) => {
        const placed = checkedIds.has(item.id);
        return (
          <li key={item.id} className="flex flex-col items-center gap-1">
            <div
              aria-label={placed ? item.label : `Pin ${i + 1}: empty`}
              className={`flex h-10 w-full items-center justify-center overflow-hidden rounded-md border ${
                placed ? "border-success/60 animate-game-pop" : "border-dashed border-border bg-surface-2"
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
              {!placed && <span className="text-sm font-bold text-text-faint">?</span>}
            </div>
            <span className={`text-[10px] font-semibold font-mono-tabular ${placed ? "text-success" : "text-text-faint"}`}>
              {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
