import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleStatus } from "@/core/progress/unlock";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { ModuleGrid } from "@/components/lobby/ModuleGrid";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

export default async function LobbyPage() {
  const user = await getServerSession();
  if (!user) return null; // the (app) layout already redirects unauthenticated visitors

  const store = getDataStore();
  const [modulesMeta, totalXp] = await Promise.all([store.listModules(), getTotalXp(user.uid)]);

  const modules = await Promise.all(
    modulesMeta.map(async (meta) => {
      const [status, progress] = await Promise.all([
        getModuleStatus(user.uid, meta.id),
        store.getModuleProgress(user.uid, meta.id),
      ]);
      return { meta, status: status.status, progress };
    }),
  );

  const level = computeLevel(totalXp);
  const completedCount = modules.filter((m) => m.status === "completed").length;
  const overallPct = Math.round((completedCount / modules.length) * 100);
  const nextModule = modules.find((m) => m.status === "available" || m.status === "in-progress");

  return (
    <main className="max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:justify-between">
          <div>
            <p className="text-sm text-text-muted">Welcome back,</p>
            <h1 className="text-2xl font-bold text-text">{user.displayName}</h1>
          </div>
          <div className="flex-1 max-w-sm w-full">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-xp">
                LVL {level.level} &mdash; {level.name}
              </span>
              <span className="text-text-faint">
                {level.xpIntoLevel}
                {level.xpForNextLevel ? ` / ${level.xpForNextLevel}` : ""} XP
              </span>
            </div>
            <ProgressBar value={level.progressPct} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total XP" value={level.totalXp.toString()} />
          <Stat label="Modules done" value={`${completedCount} / ${modules.length}`} />
          <Stat label="Overall progress" value={`${overallPct}%`} />
          <Stat label="Current level" value={level.name} />
        </div>
      </Card>

      {nextModule && (
        <p className="text-sm text-text-muted">
          Continue with <span className="text-text font-semibold">{nextModule.meta.title}</span>
        </p>
      )}

      <ModuleGrid modules={modules} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-bg-elevated border border-border-soft px-3 py-3 text-center">
      <div className="text-lg font-bold text-text">{value}</div>
      <div className="text-xs text-text-faint">{label}</div>
    </div>
  );
}
