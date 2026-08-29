import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTask, getTaskChecklistItems, isTaskUnlocked } from "@/core/content/tasks";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { Card } from "@/components/ui/Card";
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

  // Server-side enforcement: can't be bypassed by typing the URL directly.
  if (!isTaskUnlocked(moduleId, taskId, alreadyChecked)) redirect(`/modules/${moduleId}`);

  const isAssemblyTask = moduleId === "module-1" && taskId === "task-1";

  return (
    <div className="space-y-6">
      <ModuleBreadcrumb
        items={[
          { label: "Modules", href: "/lobby" },
          { label: moduleMeta.title, href: `/modules/${moduleId}` },
          { label: "Tasks", href: `/modules/${moduleId}` },
          { label: task.title },
        ]}
      />

      <div>
        <p className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-text-faint">
          {moduleMeta.title}
        </p>
        <h1 className="text-2xl font-bold text-text mt-1">{task.title}</h1>
      </div>

      <Card className="p-5 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1">Objective</p>
          <p className="text-sm text-text-muted">{task.objective}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">Materials</p>
            <div className="flex flex-wrap gap-1.5">
              {task.materials.map((m) => (
                <span key={m} className="text-xs px-2 py-1 rounded-full border border-border-soft text-text-muted">
                  {m}
                </span>
              ))}
            </div>
          </div>
          {task.tools && task.tools.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {task.tools.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full border border-border-soft text-text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {isAssemblyTask ? (
        <AssemblyChecklistActivity moduleId={moduleId} items={items} initialCheckedIds={initialCheckedIds} />
      ) : (
        <TaskChecklistActivity moduleId={moduleId} items={items} initialCheckedIds={initialCheckedIds} />
      )}
    </div>
  );
}
