"use client";

import { useState, type ReactNode } from "react";
import type { ProcedureChecklistItem } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressSegments } from "@/components/game/GameUi";
import type { SaveState } from "./useChecklistProgress";

/** Same layout language as the game frames: top bar, optional full-width stage, then a dialogue
 * area for the current step -- so the hands-on checklist and the games that follow it feel like one
 * product. */
export function ChecklistFrame({
  done,
  total,
  saveState,
  stage,
  children,
}: {
  done: number;
  total: number;
  saveState: SaveState;
  stage?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <p className="font-display text-sm font-bold text-text">✅ Task checklist</p>
        <ProgressSegments total={total} done={done} label={`${done}/${total} steps`} />
        <SaveBadge state={saveState} />
      </div>
      {stage && <div className="relative border-t border-border-soft bg-bg-elevated">{stage}</div>}
      <div className="border-t border-border-soft p-4 sm:p-5">{children}</div>
    </Card>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle") return <span className="ml-auto text-[11px] text-text-faint">Progress saves as you go</span>;
  const cfg = {
    saving: { text: "Saving…", cls: "text-text-muted" },
    saved: { text: "✓ Saved", cls: "text-success" },
    error: { text: "⚠ Not saved", cls: "text-danger" },
  }[state];
  return (
    <span key={state} className={`ml-auto text-[11px] font-semibold animate-game-pop ${cfg.cls}`} aria-live="polite">
      {cfg.text}
    </span>
  );
}

/** Compact list of every step under the frame -- done / current / upcoming at a glance, collapsible
 * so long tasks (UC1 Task 1 has 26 steps) don't push the page miles down. */
export function StepList({ items, checkedIds, nextIndex }: { items: ProcedureChecklistItem[]; checkedIds: Set<string>; nextIndex: number }) {
  const [open, setOpen] = useState(items.length <= 12);
  return (
    <Card className="p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-display text-sm font-bold text-text">All steps</span>
        <span className="text-xs font-semibold text-primary">{open ? "Hide ▲" : `Show all ${items.length} ▼`}</span>
      </button>
      {open && (
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {items.map((item, i) => {
            const done = checkedIds.has(item.id);
            const current = i === nextIndex;
            return (
              <li
                key={item.id}
                className={`flex items-start gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm ${
                  current ? "border border-primary/60 bg-primary/10" : ""
                }`}
              >
                <span
                  className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    done ? "bg-success text-[#03140d]" : current ? "bg-primary text-[#04141c]" : "bg-surface-2 text-text-faint"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={done ? "text-text-muted line-through decoration-success/50" : current ? "font-semibold text-text" : "text-text-faint"}>
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

/** The finish row shown in the dialogue area once every step is checked. */
export function ChecklistComplete({ total, onContinue, busy }: { total: number; onContinue: () => void; busy: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 animate-game-pop">
      <span className="text-4xl" aria-hidden>
        🎉
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold text-text">Checklist complete!</p>
        <p className="text-sm text-text-muted">All {total} steps done. Next: prove it in the game and quiz.</p>
      </div>
      <Button onClick={onContinue} disabled={busy}>
        {busy ? "Saving..." : "Take the quiz ▶"}
      </Button>
    </div>
  );
}
