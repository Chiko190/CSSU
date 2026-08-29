import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleStatus } from "@/core/progress/unlock";
import { getModuleContent, getActivityRequiredIds } from "@/core/content/loader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconTrophy, IconCheckCircle } from "@/components/ui/Icon";

export default async function CompletePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const [progress, allModules] = await Promise.all([store.getModuleProgress(user.uid, moduleId), store.listModules()]);

  const content = getModuleContent(moduleId);
  const requiredIds = content ? getActivityRequiredIds(content.activity) : [];
  const checkedIds = new Set(progress?.activityCheckedIds ?? []);
  const activityDone = requiredIds.length > 0 && requiredIds.every((id) => checkedIds.has(id));
  const moduleComplete = Boolean(progress?.completedAt);

  const nextModule = allModules.find((m) => m.requiresModuleId === moduleId) ?? null;
  const nextModuleUnlocked = nextModule ? (await getModuleStatus(user.uid, nextModule.id)).unlocked : false;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-10">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-xp/10 text-xp">
        <IconTrophy />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
          Module {moduleMeta.order.toString().padStart(2, "0")} {moduleComplete ? "complete" : "quiz passed"}
        </p>
        <h1 className="text-2xl font-bold text-text mt-1">{moduleMeta.title}</h1>
      </div>

      <Card className="p-6 w-full max-w-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-text">{progress?.bestQuizScorePct ?? 0}%</div>
            <div className="text-xs text-text-faint">Best quiz score</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${activityDone ? "text-success" : "text-text-muted"}`}>
              {activityDone ? "Done" : "In progress"}
            </div>
            <div className="text-xs text-text-faint">Hands-on activity</div>
          </div>
        </div>
      </Card>

      {!activityDone && (
        <Card className="p-4 w-full max-w-sm text-left">
          <p className="text-sm text-text-muted">
            You&apos;ve passed the quiz, but there are still task steps left to check off before this module
            counts as complete.
          </p>
          <Link href={`/modules/${moduleId}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            <IconCheckCircle className="h-3.5 w-3.5" /> Finish the remaining tasks
          </Link>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link href="/lobby" className="flex-1">
          <Button variant="secondary" className="w-full">
            Back to Modules
          </Button>
        </Link>
        {moduleComplete && nextModule && nextModuleUnlocked && (
          <Link href={`/modules/${nextModule.id}`} className="flex-1">
            <Button className="w-full">Continue to {nextModule.title}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
