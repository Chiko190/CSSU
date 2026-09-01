import type { ProcedureChecklistItem, TaskContent } from "./types";
import { getModuleContent } from "./loader";
import { UNLOCK_ALL } from "@/lib/featureFlags";
import { module1Tasks } from "./module-1/tasks";
import { module2Tasks } from "./module-2/tasks";
import { module3Tasks } from "./module-3/tasks";
import { module4Tasks } from "./module-4/tasks";

const TASKS_BY_MODULE: Record<string, TaskContent[]> = {
  "module-1": module1Tasks,
  "module-2": module2Tasks,
  "module-3": module3Tasks,
  "module-4": module4Tasks,
};

export function getTasksForModule(moduleId: string): TaskContent[] {
  return TASKS_BY_MODULE[moduleId] ?? [];
}

export function getTask(moduleId: string, taskId: string): TaskContent | null {
  return getTasksForModule(moduleId).find((task) => task.id === taskId) ?? null;
}

function isTaskDone(task: TaskContent, checkedIds: Set<string>): boolean {
  return task.itemIds.length > 0 && task.itemIds.every((id) => checkedIds.has(id));
}

/** Tasks unlock in order: task N requires task N-1's checklist to be fully checked AND its own
 * 15-question quiz to be passed -- each task's quiz is now the actual knowledge-check gate, not
 * just its checklist. `passedTaskIds` is every taskId this learner has passed the quiz for. */
export function isTaskUnlocked(
  moduleId: string,
  taskId: string,
  checkedIds: Set<string>,
  passedTaskIds: Set<string>,
): boolean {
  if (UNLOCK_ALL) return true;
  const tasks = getTasksForModule(moduleId);
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index <= 0) return true;
  const previous = tasks[index - 1];
  return isTaskDone(previous, checkedIds) && passedTaskIds.has(previous.id);
}

/** Resolves a task's itemIds against its module's activity checklist, in the task's own order. */
export function getTaskChecklistItems(moduleId: string, task: TaskContent): ProcedureChecklistItem[] {
  const content = getModuleContent(moduleId);
  if (!content || content.activity.kind !== "procedure-checklist") return [];
  const byId = new Map(content.activity.items.map((item) => [item.id, item]));
  return task.itemIds.map((id) => byId.get(id)).filter((item): item is ProcedureChecklistItem => Boolean(item));
}
