import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataStore } from "@/core/data/store";
import { getTasksForModule } from "@/core/content/tasks";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { Card } from "@/components/ui/Card";
import { IconChevronRight } from "@/components/ui/Icon";

export default async function ModuleTasksPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const tasks = getTasksForModule(moduleId);

  return (
    <div className="space-y-6">
      <ModuleBreadcrumb
        items={[
          { label: "Modules", href: "/lobby" },
          { label: moduleMeta.title, href: `/modules/${moduleId}` },
          { label: "Tasks" },
        ]}
      />

      <div>
        <p className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-text-faint">
          Module {moduleMeta.order.toString().padStart(2, "0")}
        </p>
        <h1 className="text-2xl font-bold text-text mt-1">{moduleMeta.title}</h1>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Link key={task.id} href={`/modules/${moduleId}/tasks/${task.id}`} className="block">
            <Card className="p-4 flex items-center justify-between hover:border-primary/60 transition-colors">
              <span className="font-semibold text-text">{task.title}</span>
              <IconChevronRight className="h-4 w-4 text-text-faint" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
