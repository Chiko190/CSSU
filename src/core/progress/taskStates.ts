import type { UserModuleProgress } from "@/core/data/types";
import type { TaskContent } from "@/core/content/types";
import { getTasksForModule, isTaskUnlocked } from "@/core/content/tasks";

export type TaskPhase = "locked" | "checklist" | "quiz" | "done";

export interface TaskState {
  task: TaskContent;
  /** 1-based, for display ("Task 3"). */
  number: number;
  phase: TaskPhase;
  checkedCount: number;
  stepCount: number;
  bestScorePct: number | null;
  /** The first task that isn't done yet -- what "Continue" points at. */
  current: boolean;
  /** Where tapping this task goes: its checklist, or straight to its quiz once the checklist is done. */
  href: string;
}

export interface ModuleProgressSummary {
  tasks: TaskState[];
  doneCount: number;
  lessonDone: boolean;
  complete: boolean;
  /** 0-100 -- finished tasks over total tasks. */
  pct: number;
  /** The single best next action in this module, or null when it's complete. */
  next: { href: string; label: string } | null;
}

/** One place that turns a module's raw progress row into per-task states and a "what's next" --
 * so the lobby, the module page and anything else always agree on what a learner should do. */
export function summarizeModuleProgress(moduleId: string, progress: UserModuleProgress | null): ModuleProgressSummary {
  const tasks = getTasksForModule(moduleId);
  const checked = new Set(progress?.activityCheckedIds ?? []);
  const passed = new Set(
    Object.entries(progress?.taskQuizzes ?? {})
      .filter(([, tq]) => tq.passed)
      .map(([id]) => id),
  );

  let currentAssigned = false;
  const states: TaskState[] = tasks.map((task, i) => {
    const checkedCount = task.itemIds.filter((id) => checked.has(id)).length;
    const checklistDone = task.itemIds.length > 0 && checkedCount === task.itemIds.length;
    const quizPassed = passed.has(task.id);
    const unlocked = isTaskUnlocked(moduleId, task.id, checked, passed);
    const phase: TaskPhase = checklistDone && quizPassed ? "done" : !unlocked ? "locked" : checklistDone ? "quiz" : "checklist";
    const current = !currentAssigned && phase !== "done" && phase !== "locked";
    if (current) currentAssigned = true;
    const base = `/modules/${moduleId}/tasks/${task.id}`;
    return {
      task,
      number: i + 1,
      phase,
      checkedCount,
      stepCount: task.itemIds.length,
      bestScorePct: progress?.taskQuizzes[task.id]?.bestScorePct ?? null,
      current,
      href: phase === "quiz" ? `${base}/quiz` : base,
    };
  });

  const doneCount = states.filter((s) => s.phase === "done").length;
  const lessonDone = Boolean(progress?.lessonCompletedAt);
  const complete = Boolean(progress?.completedAt);
  const currentTask = states.find((s) => s.current) ?? null;
  const untouched = !lessonDone && doneCount === 0 && states.every((s) => s.checkedCount === 0);

  let next: ModuleProgressSummary["next"] = null;
  if (!complete) {
    if (untouched) next = { href: `/modules/${moduleId}/learn`, label: "Start with the briefing" };
    else if (currentTask)
      next = {
        href: currentTask.href,
        label:
          currentTask.phase === "quiz"
            ? `Task ${currentTask.number} quiz: ${currentTask.task.title}`
            : `Task ${currentTask.number}: ${currentTask.task.title}`,
      };
  }

  return {
    tasks: states,
    doneCount,
    lessonDone,
    complete,
    pct: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
    next,
  };
}
