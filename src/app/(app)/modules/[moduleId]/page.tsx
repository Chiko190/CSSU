import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTasksForModule, isTaskUnlocked } from "@/core/content/tasks";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { Card } from "@/components/ui/Card";
import { IconChevronRight, IconCheckCircle, IconDownload, IconLock } from "@/components/ui/Icon";

const GUIDE_FILES: Record<string, string> = {
  "module-1": "guide.pdf",
  "module-2": "guide.docx",
  "module-3": "guide.docx",
  "module-4": "guide.docx",
};

export default async function ModuleTasksPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const tasks = getTasksForModule(moduleId);
  const progress = await store.getModuleProgress(user.uid, moduleId);
  const checkedIds = new Set(progress?.activityCheckedIds ?? []);
  const guideFile = GUIDE_FILES[moduleId];

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
        {guideFile && (
          <a href={`/modules/${moduleId}/${guideFile}`} download className="block">
            <Card className="p-4 flex items-center justify-between hover:border-primary/60 transition-colors">
              <span className="flex items-center gap-2">
                <IconDownload className="h-4 w-4 text-text-faint shrink-0" />
                <span className="font-semibold text-text">Module Guide</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                Download
              </span>
            </Card>
          </a>
        )}
        {tasks.map((task, index) => {
          const done = task.itemIds.length > 0 && task.itemIds.every((id) => checkedIds.has(id));
          const unlocked = isTaskUnlocked(moduleId, task.id, checkedIds);

          if (!unlocked) {
            return (
              <Card
                key={task.id}
                className="p-4 flex items-center justify-between opacity-60 cursor-not-allowed"
              >
                <span className="flex items-center gap-2.5">
                  <IconLock className="h-4 w-4 text-text-faint shrink-0" />
                  <span className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                      Task {index + 1}
                    </span>
                    <span className="font-semibold text-text-muted">{task.title}</span>
                  </span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Locked
                </span>
              </Card>
            );
          }

          return (
            <Link key={task.id} href={`/modules/${moduleId}/tasks/${task.id}`} className="block">
              <Card
                className={`p-4 flex items-center justify-between transition-colors ${
                  done ? "border-success/40 hover:border-success/70" : "hover:border-primary/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {done && <IconCheckCircle className="h-4 w-4 text-success shrink-0" />}
                  <span className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                      Task {index + 1}
                    </span>
                    <span className="font-semibold text-text">{task.title}</span>
                  </span>
                </span>
                <IconChevronRight className="h-4 w-4 text-text-faint shrink-0" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
