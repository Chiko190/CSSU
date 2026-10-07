import Link from "next/link";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleStatus } from "@/core/progress/unlock";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { summarizeModuleProgress } from "@/core/progress/taskStates";
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
      return { meta, status: status.status, progress, summary: summarizeModuleProgress(meta.id, progress) };
    }),
  );

  const level = computeLevel(totalXp);
  const completedCount = modules.filter((m) => m.status === "completed").length;
  const tasksDone = modules.reduce((n, m) => n + m.summary.doneCount, 0);
  const tasksTotal = modules.reduce((n, m) => n + m.summary.tasks.length, 0);
  const nextModule = modules.find((m) => m.status === "available" || m.status === "in-progress");
  const allDone = completedCount === modules.length;

  return (
    <main className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
      {/* Player card */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-xp/50 bg-xp/10 font-display text-2xl font-bold text-xp shadow-[0_0_24px_rgba(250,204,21,0.15)]">
            {level.level}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-muted">Welcome back, technician</p>
            <h1 className="truncate text-xl sm:text-2xl font-bold text-text">{user.displayName}</h1>
            <p className="text-xs font-semibold text-xp">
              LVL {level.level} · {level.name}
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
            <Stat label="Total XP" value={level.totalXp.toLocaleString()} accent="text-xp" />
            <Stat label="Modules" value={`${completedCount}/${modules.length}`} />
            <Stat label="Tasks" value={`${tasksDone}/${tasksTotal}`} />
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-text-faint">
            <span>{level.nextLevelMinXp ? `Next level at ${level.nextLevelMinXp} XP` : "Max level reached"}</span>
            <span className="font-mono-tabular">
              {level.xpIntoLevel}
              {level.xpForNextLevel ? ` / ${level.xpForNextLevel}` : ""} XP
            </span>
          </div>
          <ProgressBar value={level.progressPct} />
        </div>
      </Card>

      {/* Continue -- the one obvious next action */}
      {nextModule && nextModule.summary.next && (
        <Link href={nextModule.summary.next.href} className="group block">
          <Card className="relative overflow-hidden p-0 border-primary/50 shadow-[var(--shadow-glow-primary)] transition-transform group-hover:-translate-y-0.5">
            <div className="flex flex-col sm:flex-row">
              {nextModule.meta.heroImage && (
                <div className="relative h-28 sm:h-auto sm:w-48 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover */}
                  <img src={nextModule.meta.heroImage.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-surface via-surface/30 to-transparent" />
                </div>
              )}
              <div className="flex flex-1 flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    ▶ Continue · Module {nextModule.meta.order.toString().padStart(2, "0")}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold text-text">{nextModule.meta.title}</p>
                  <p className="text-sm text-text-muted">Next up: {nextModule.summary.next.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={nextModule.summary.pct} className="max-w-[220px]" />
                    <span className="text-[11px] font-mono-tabular text-text-faint">
                      {nextModule.summary.doneCount}/{nextModule.summary.tasks.length} tasks
                    </span>
                  </div>
                </div>
                {/* Styled like a Button, but a span: the whole card is already the link. */}
                <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-6 py-3 font-semibold text-[#04141c] shadow-[var(--shadow-glow-primary)] transition-colors group-hover:bg-primary-strong">
                  Play ▶
                </span>
              </div>
            </div>
          </Card>
        </Link>
      )}
      {allDone && (
        <Card className="p-5 text-center border-success/40">
          <p className="text-3xl">🏆</p>
          <p className="font-display text-lg font-bold text-text">All four units complete!</p>
          <p className="text-sm text-text-muted">You&apos;ve finished every module -- revisit any one to replay its games or grab its certificate.</p>
        </Card>
      )}

      <div className="flex items-end justify-between">
        <h2 className="font-display text-lg font-bold text-text">Campaign</h2>
        <p className="text-xs text-text-faint">TESDA CSS NC II · UC1 – UC{modules.length}</p>
      </div>
      <ModuleGrid modules={modules} />
    </main>
  );
}

function Stat({ label, value, accent = "text-text" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2 text-center">
      <div className={`font-mono-tabular text-base font-bold ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-text-faint">{label}</div>
    </div>
  );
}
