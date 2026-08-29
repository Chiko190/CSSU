import { getDataStore } from "@/core/data/store";
import type { ModuleStatus } from "@/core/data/types";
import { UNLOCK_ALL } from "@/lib/featureFlags";

export class ModuleLockedError extends Error {
  moduleId: string;
  constructor(moduleId: string) {
    super(`Module ${moduleId} is locked`);
    this.name = "ModuleLockedError";
    this.moduleId = moduleId;
  }
}

export class UnknownModuleError extends Error {
  moduleId: string;
  constructor(moduleId: string) {
    super(`Unknown module: ${moduleId}`);
    this.name = "UnknownModuleError";
    this.moduleId = moduleId;
  }
}

export interface ModuleUnlockResult {
  moduleId: string;
  status: ModuleStatus;
  unlocked: boolean;
  requiresModuleId: string | null;
}

/**
 * Computes a module's lock/unlock status lazily from the previous module's
 * completion, rather than a status pre-materialized on every module row for
 * every user. Module 1 (requiresModuleId === null) is always unlocked.
 */
export async function getModuleStatus(uid: string, moduleId: string): Promise<ModuleUnlockResult> {
  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) throw new UnknownModuleError(moduleId);

  if (UNLOCK_ALL) {
    return { moduleId, status: "available", unlocked: true, requiresModuleId: moduleMeta.requiresModuleId };
  }

  const progress = await store.getModuleProgress(uid, moduleId);
  if (progress) {
    return {
      moduleId,
      status: progress.status,
      unlocked: true,
      requiresModuleId: moduleMeta.requiresModuleId,
    };
  }

  if (!moduleMeta.requiresModuleId) {
    return { moduleId, status: "available", unlocked: true, requiresModuleId: null };
  }

  const prereq = await store.getModuleProgress(uid, moduleMeta.requiresModuleId);
  const unlocked = prereq?.status === "completed";
  return {
    moduleId,
    status: unlocked ? "available" : "locked",
    unlocked,
    requiresModuleId: moduleMeta.requiresModuleId,
  };
}

/** Throws ModuleLockedError if the module isn't unlocked. Used at the top of every module-scoped API route. */
export async function assertModuleUnlocked(uid: string, moduleId: string): Promise<void> {
  const result = await getModuleStatus(uid, moduleId);
  if (!result.unlocked) throw new ModuleLockedError(moduleId);
}
