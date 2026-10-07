import type { Mission, MissionGameCheck, SceneEffect, SceneLink, SceneNode } from "./types";

/** Builds a MissionGameCheck with `items` derived from its missions, and validates the content up
 * front (unique ids, every step has exactly one right answer, effects point at real nodes/links)
 * so a content typo fails loudly at startup instead of soft-locking a learner mid-game. */
export function missionGame(def: Omit<MissionGameCheck, "kind" | "items">): MissionGameCheck {
  const nodeIds = new Set(def.scene.nodes.map((n) => n.id));
  const linkIds = new Set(def.scene.links.map((l) => l.id));
  const seen = new Set<string>();
  const unique = (id: string) => {
    if (seen.has(id)) throw new Error(`Duplicate mission-game id: ${id}`);
    seen.add(id);
  };
  const checkEffect = (e: SceneEffect, where: string) => {
    const ok = e.kind === "link" ? linkIds.has(e.link) : nodeIds.has(e.node);
    if (!ok) throw new Error(`${where}: effect points at unknown ${e.kind === "link" ? "link" : "node"}`);
  };

  for (const link of def.scene.links) {
    if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) throw new Error(`Link ${link.id} has an unknown end`);
  }
  for (const mission of def.missions) {
    unique(mission.id);
    for (const step of mission.steps) {
      unique(step.id);
      if (!nodeIds.has(step.actor)) throw new Error(`${step.id}: unknown actor ${step.actor}`);
      if (step.pulse && !linkIds.has(step.pulse.link)) throw new Error(`${step.id}: unknown pulse link`);
      step.effects?.forEach((e) => checkEffect(e, step.id));
      if (step.kind === "choice" && step.options.filter((o) => o.correct).length !== 1) {
        throw new Error(`${step.id}: a choice step needs exactly one correct option`);
      }
      if (step.kind === "slots" && !step.chips.some((c) => c.correct)) {
        throw new Error(`${step.id}: a slots step needs at least one correct chip`);
      }
    }
  }
  return { kind: "mission-game", ...def, items: def.missions.map((m) => ({ id: m.id })) };
}

export interface SceneState {
  nodes: (SceneNode & { badges: string[] })[];
  links: (SceneLink & { active: boolean })[];
}

/** The map as it looks after `doneStepIds` -- recomputed from scratch each time, so a reload
 * (which restores finished missions from the server) rebuilds exactly the same world. */
export function computeScene(check: MissionGameCheck, doneStepIds: Set<string>): SceneState {
  const nodes = new Map(check.scene.nodes.map((n) => [n.id, { ...n, status: n.status ?? "on", badges: [] as string[] }]));
  const active = new Set<string>();
  const apply = (e: SceneEffect) => {
    if (e.kind === "link") {
      active.add(e.link);
      return;
    }
    const node = nodes.get(e.node);
    if (!node) return;
    if (e.kind === "badge" && !node.badges.includes(e.text)) node.badges.push(e.text);
    if (e.kind === "sublabel") node.sublabel = e.text;
    if (e.kind === "status") node.status = e.status;
  };

  for (const mission of check.missions) {
    for (const step of mission.steps) {
      if (!doneStepIds.has(step.id)) continue;
      if (step.kind === "slots") {
        step.chips.filter((c) => c.correct).forEach((c) => apply({ kind: "badge", node: step.actor, text: c.text }));
      }
      step.effects?.forEach(apply);
    }
  }
  return {
    nodes: [...nodes.values()],
    links: check.scene.links.map((l) => ({ ...l, active: active.has(l.id) })),
  };
}

/** Every step id in the given missions -- used to rebuild the scene for missions already finished. */
export function stepIdsOf(missions: Mission[]): string[] {
  return missions.flatMap((m) => m.steps.map((s) => s.id));
}
