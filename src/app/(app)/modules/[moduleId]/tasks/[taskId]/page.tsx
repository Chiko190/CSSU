import { notFound } from "next/navigation";
import { getDataStore } from "@/core/data/store";
import { getTask } from "@/core/content/tasks";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { Card } from "@/components/ui/Card";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ moduleId: string; taskId: string }>;
}) {
  const { moduleId, taskId } = await params;
  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const task = getTask(moduleId, taskId);
  if (!task) notFound();

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

      <Card className="p-5">
        <p className="text-sm text-text-muted">
          Content for this task hasn&apos;t been added yet.
        </p>
      </Card>
    </div>
  );
}
