import type { MiniGameStage, MiniGamesCheck, PracticalCheck } from "./types";

/** The ids a stage completes with, in the order they must be done for a sequence (any order for a
 * match). Traps are never included -- they can't be "completed". */
export function stageItemIds(stage: MiniGameStage): string[] {
  return stage.kind === "sequence" ? stage.steps.map((s) => s.id) : stage.pairs.map((p) => p.id);
}

/** Builds a MiniGamesCheck with its flattened `items` derived from the stages, so they can never
 * drift apart. Throws on a duplicate id across stages, since progress is persisted per id. */
export function miniGames(stages: MiniGameStage[]): MiniGamesCheck {
  const ids = stages.flatMap(stageItemIds);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`Duplicate mini-game item id: ${id}`);
    seen.add(id);
  }
  return { kind: "mini-games", stages, items: ids.map((id) => ({ id })) };
}

/** Whether `itemId` may be completed next given what's already done -- the server-side order
 * guard for the practical-check persistence route. Re-completing an already-done id is allowed
 * (idempotent retries). Assembly/wire-order checks are strictly sequential; a mini-games check
 * plays its stages in order, a sequence stage's steps in order, and a match stage's pairs in any
 * order. */
export function canCompletePracticalItem(check: PracticalCheck, checkedIds: Set<string>, itemId: string): boolean {
  if (checkedIds.has(itemId)) return true;

  if (check.kind !== "mini-games") {
    const next = check.items.find((item) => !checkedIds.has(item.id));
    return next?.id === itemId;
  }

  const stage = check.stages.find((s) => stageItemIds(s).some((id) => !checkedIds.has(id)));
  if (!stage) return false;
  const remaining = stageItemIds(stage).filter((id) => !checkedIds.has(id));
  return stage.kind === "sequence" ? remaining[0] === itemId : remaining.includes(itemId);
}
