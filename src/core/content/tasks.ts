export interface ModuleTask {
  id: string;
  title: string;
}

/** Task counts per module mirror the real TESDA task/job sheets in modules/uc{1..4}. */
const TASKS_BY_MODULE: Record<string, ModuleTask[]> = {
  "module-1": [
    { id: "task-1", title: "Task 1" },
    { id: "task-2", title: "Task 2" },
    { id: "task-3", title: "Task 3" },
    { id: "task-4", title: "Task 4" },
  ],
  "module-2": [
    { id: "task-1", title: "Task 1" },
    { id: "task-2", title: "Task 2" },
  ],
  "module-3": [
    { id: "task-1", title: "Task 1" },
    { id: "task-2", title: "Task 2" },
  ],
  "module-4": [{ id: "task-1", title: "Task 1" }],
};

export function getTasksForModule(moduleId: string): ModuleTask[] {
  return TASKS_BY_MODULE[moduleId] ?? [];
}

export function getTask(moduleId: string, taskId: string): ModuleTask | null {
  return getTasksForModule(moduleId).find((task) => task.id === taskId) ?? null;
}
