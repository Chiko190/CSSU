import type { ModuleMeta, ModuleStatus, UserModuleProgress } from "@/core/data/types";
import { ModuleCard } from "./ModuleCard";

export interface ModuleWithStatus {
  meta: ModuleMeta;
  status: ModuleStatus;
  progress: UserModuleProgress | null;
}

export function ModuleGrid({ modules }: { modules: ModuleWithStatus[] }) {
  const titleById = new Map(modules.map((m) => [m.meta.id, m.meta.title]));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map(({ meta, status, progress }) => (
        <ModuleCard
          key={meta.id}
          moduleMeta={meta}
          status={status}
          progress={progress}
          prerequisiteTitle={meta.requiresModuleId ? (titleById.get(meta.requiresModuleId) ?? null) : null}
        />
      ))}
    </div>
  );
}
