import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTask, getTaskChecklistItems, getTasksForModule, isTaskUnlocked } from "@/core/content/tasks";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { BackLink } from "@/components/module/BackLink";
import { TaskChecklistActivity } from "@/components/activity/TaskChecklistActivity";
import { AssemblyChecklistActivity } from "@/components/activity/AssemblyChecklistActivity";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ moduleId: string; taskId: string }>;
}) {
  const { moduleId, taskId } = await params;
  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const task = getTask(moduleId, taskId);
  if (!task) notFound();

  const items = getTaskChecklistItems(moduleId, task);
  const progress = await store.getModuleProgress(user.uid, moduleId);
  const alreadyChecked = new Set(progress?.activityCheckedIds ?? []);
  const initialCheckedIds = task.itemIds.filter((id) => alreadyChecked.has(id));
  const passedTaskIds = new Set(
    Object.entries(progress?.taskQuizzes ?? {})
      .filter(([, tq]) => tq.passed)
      .map(([id]) => id),
  );

  // Server-side enforcement: can't be bypassed by typing the URL directly.
  if (!isTaskUnlocked(moduleId, taskId, alreadyChecked, passedTaskIds)) redirect(`/modules/${moduleId}`);

  // Task 1 (disassembly) and Task 2 (assembly) are the two halves of the same hands-on 3D PC
  // build -- both render the interactive scene; Task 2's steps are install-only, which
  // AssemblyScene's settledPosition() handles.
  const isAssemblyTask = moduleId === "module-1" && (taskId === "task-1" || taskId === "task-2");

  // Every task now has its own quiz -- "Mark Task Complete" always sends the learner into it.
  // Doing the task hands-on and then immediately being asked to explain the "why" behind it is
  // the whole point of the quiz existing at all -- without this it's just a checklist with no
  // knowledge check at the end.
  const completionHref = `/modules/${moduleId}/tasks/${taskId}/quiz`;

  const kit = [...task.materials, ...(task.tools ?? [])];
  const taskNumber = getTasksForModule(moduleId).findIndex((t) => t.id === task.id) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ModuleBreadcrumb
          items={[
            { label: "Modules", href: "/lobby" },
            { label: moduleMeta.title, href: `/modules/${moduleId}` },
            { label: task.title },
          ]}
        />
        <BackLink href={`/modules/${moduleId}`} label="Quest path" />
      </div>

      {/* Compact header -- the checklist frame below is the main event, so keep it near the top. */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          UC {moduleMeta.order} · Task {taskNumber}
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-bold text-text">{task.title}</h1>
        <p className="mt-1 text-sm text-text-muted">🎯 {task.objective}</p>
        {kit.length > 0 && (
          <details className="group mt-2">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-text-faint hover:text-text">
              🧰 Materials &amp; tools ({kit.length}) <span className="transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.materials.map((m) => (
                <span key={m} className="rounded-full border border-border-soft px-2 py-1 text-xs text-text-muted">
                  {m}
                </span>
              ))}
              {(task.tools ?? []).map((t) => (
                <span key={t} className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-text-muted">
                  🔧 {t}
                </span>
              ))}
            </div>
          </details>
        )}
      </div>

      {isAssemblyTask ? (
        <AssemblyChecklistActivity
          moduleId={moduleId}
          items={items}
          initialCheckedIds={initialCheckedIds}
          completionHref={completionHref}
        />
      ) : (
        <TaskChecklistActivity
          moduleId={moduleId}
          items={items}
          initialCheckedIds={initialCheckedIds}
          completionHref={completionHref}
        />
      )}
    </div>
  );
}
