import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTasksForModule, isTaskUnlocked } from "@/core/content/tasks";
import { getModuleContent, getActivityRequiredIds } from "@/core/content/loader";
import { ModuleBreadcrumb } from "@/components/module/ModuleBreadcrumb";
import { BackLink } from "@/components/module/BackLink";
import { Card } from "@/components/ui/Card";
import { IconChevronRight, IconCheckCircle, IconDownload, IconLock, IconSparkle } from "@/components/ui/Icon";
import { AssemblyModelsPreloader } from "@/3d/AssemblyModelsPreloader";

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

  // The quiz is the knowledge check for what the tasks just walked through hands-on -- it unlocks
  // the same way tasks do, once every task above it is actually done, rather than sitting there
  // as a generic link the whole time. Same "every required id checked" test /complete already
  // uses to decide activityDone, so this page and the server-side redirect on /check agree.
  const content = getModuleContent(moduleId);
  const requiredIds = content ? getActivityRequiredIds(content.activity) : [];
  const allTasksDone = requiredIds.length > 0 && requiredIds.every((id) => checkedIds.has(id));
  const bestQuizScorePct = progress?.bestQuizScorePct ?? null;

  return (
    <div className="space-y-6">
      {/* Task 1's 3D scene is the heaviest thing in this module -- start fetching its models the
       * moment the learner reaches this list, so the scene is already cached by the time they
       * tap in and don't sit on a "Loading parts..." screen. */}
      {moduleId === "module-1" && <AssemblyModelsPreloader />}
      <div className="flex items-center justify-between">
        <ModuleBreadcrumb
          items={[
            { label: "Modules", href: "/lobby" },
            { label: moduleMeta.title, href: `/modules/${moduleId}` },
            { label: "Tasks" },
          ]}
        />
        <BackLink href="/lobby" label="Back to Lobby" />
      </div>

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

        {allTasksDone ? (
          <Link href={`/modules/${moduleId}/check`} className="block">
            <Card className="p-4 flex items-center justify-between border-primary/60 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="flex items-center gap-2.5">
                <IconSparkle className="h-4 w-4 text-primary shrink-0" />
                <span className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Knowledge Check
                  </span>
                  <span className="font-semibold text-text">
                    {bestQuizScorePct !== null ? `Retake the Module Quiz -- best ${bestQuizScorePct}%` : "Take the Module Quiz"}
                  </span>
                </span>
              </span>
              <IconChevronRight className="h-4 w-4 text-primary shrink-0" />
            </Card>
          </Link>
        ) : (
          <Card className="p-4 flex items-center justify-between opacity-60 cursor-not-allowed">
            <span className="flex items-center gap-2.5">
              <IconLock className="h-4 w-4 text-text-faint shrink-0" />
              <span className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Knowledge Check
                </span>
                <span className="font-semibold text-text-muted">Module Quiz</span>
              </span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-text-faint">
              Complete all tasks first
            </span>
          </Card>
        )}
      </div>
    </div>
  );
}
