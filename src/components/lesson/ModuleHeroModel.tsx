"use client";

import type { ModuleHeroModel } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";

/** A small rotating 3D preview shown above the lesson cards -- for modules whose
 * graded activity (a text procedure-checklist) has no visual of its own. */
export function ModuleHeroModel({ model }: { model: ModuleHeroModel }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="relative w-full h-[220px] sm:h-[260px] bg-bg-elevated">
        <PartViewer shape={{ kind: "model", url: model.url }} rotation={model.rotation} />
      </div>
      {model.credit && (
        <p className="px-4 py-2 text-[11px] text-text-faint border-t border-border-soft">{model.credit}</p>
      )}
    </Card>
  );
}
