import type { ModuleMeta, ModuleStatus, UserModuleProgress } from "@/core/data/types";
import type { ModuleProgressSummary } from "@/core/progress/taskStates";
import { ModuleCard } from "./ModuleCard";

export interface ModuleWithStatus {
  meta: ModuleMeta;
  status: ModuleStatus;
  progress: UserModuleProgress | null;
  summary: ModuleProgressSummary;
}

/** The campaign: one card per unit of competency, two per row so four units fill a clean 2x2. */
export function ModuleGrid({ modules }: { modules: ModuleWithStatus[] }) {
  const titleById = new Map(modules.map((m) => [m.meta.id, m.meta.title]));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modules.map(({ meta, status, summary }) => (
        <ModuleCard
          key={meta.id}
          moduleMeta={meta}
          status={status}
          summary={summary}
          prerequisiteTitle={meta.requiresModuleId ? (titleById.get(meta.requiresModuleId) ?? null) : null}
        />
      ))}
    </div>
  );
}
