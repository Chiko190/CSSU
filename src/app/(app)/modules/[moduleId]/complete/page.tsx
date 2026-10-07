import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleStatus } from "@/core/progress/unlock";
import { summarizeModuleProgress } from "@/core/progress/taskStates";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Certificate } from "@/components/certificate/Certificate";
import { Confetti } from "@/components/game/GameUi";

/** Where the last task's quiz "Continue" lands: a victory screen when the unit is done (stats,
 * certificate, next-unit card), or a clear "almost there" screen listing what's left when it isn't. */
export default async function CompletePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const [progress, allModules, xpEvents] = await Promise.all([
    store.getModuleProgress(user.uid, moduleId),
    store.listModules(),
    store.listXpEvents(user.uid),
  ]);

  const summary = summarizeModuleProgress(moduleId, progress);
  const moduleXp = xpEvents.filter((e) => e.moduleId === moduleId).reduce((n, e) => n + e.amount, 0);
  const perfects = xpEvents.filter((e) => e.moduleId === moduleId && e.type === "quiz_perfect_bonus").length;
  const scores = summary.tasks.map((t) => t.bestScorePct).filter((s): s is number => s !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const nextModule = allModules.find((m) => m.requiresModuleId === moduleId) ?? null;
  const nextModuleUnlocked = nextModule ? (await getModuleStatus(user.uid, nextModule.id)).unlocked : false;
  const unit = `UC ${moduleMeta.order}`;

  if (!summary.complete) {
    const remaining = summary.tasks.filter((t) => t.phase !== "done");
    return (
      <div className="space-y-5">
        <Card className="p-6 sm:p-8 text-center space-y-3">
          <p className="text-4xl">🚧</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">{unit} · almost there</p>
          <h1 className="font-display text-2xl font-bold text-text">{moduleMeta.title}</h1>
          <div className="mx-auto flex max-w-xs items-center gap-2">
            <ProgressBar value={summary.pct} />
            <span className="shrink-0 font-mono-tabular text-xs text-text-muted">
              {summary.doneCount}/{summary.tasks.length}
            </span>
          </div>
          <p className="text-sm text-text-muted">Finish these to complete the unit and earn its certificate:</p>
          <ul className="mx-auto max-w-sm space-y-1.5 text-left">
            {remaining.map((t) => (
              <li key={t.task.id}>
                <Link
                  href={t.phase === "locked" ? `/modules/${moduleId}` : t.href}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2 text-sm hover:border-primary/60"
                >
                  <span className="truncate text-text">
                    Task {t.number}: {t.task.title}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {t.phase === "quiz" ? "Quiz ▶" : t.phase === "locked" ? "🔒" : `${t.checkedCount}/${t.stepCount} ▶`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="text-center">
          <Link href={`/modules/${moduleId}`} className="text-sm font-semibold text-primary hover:underline">
            ◀ Back to the quest path
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Confetti seed={`unit-${moduleId}`} count={90} />

      <Card className="relative overflow-hidden p-0 border-success/40 animate-game-pop">
        {moduleMeta.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover
          <img src={moduleMeta.heroImage.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/90 to-surface" />
        <div className="relative space-y-4 p-6 sm:p-8 text-center">
          <p className="text-5xl">🏆</p>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-success">{unit} complete</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-text">{moduleMeta.title}</h1>
            <p className="mt-1 text-sm text-text-muted">Unit cleared, {user.displayName}! Here&apos;s how you did.</p>
          </div>
          <div className="mx-auto grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Tasks" value={`${summary.doneCount}/${summary.tasks.length}`} />
            <Stat label="Avg quiz" value={avgScore !== null ? `${avgScore}%` : "--"} />
            <Stat label="Perfect" value={`🎯 ${perfects}`} />
            <Stat label="XP earned" value={`+${moduleXp}`} accent="text-xp" />
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-3">
        <p className="self-start font-display text-lg font-bold text-text">Your certificate</p>
        <Certificate moduleTitle={moduleMeta.title} playerName={user.displayName} />
      </div>

      {nextModule && nextModuleUnlocked ? (
        <Link href={`/modules/${nextModule.id}`} className="group block">
          <Card className="relative overflow-hidden p-0 border-primary/50 shadow-[var(--shadow-glow-primary)] transition-transform group-hover:-translate-y-0.5">
            <div className="flex flex-col sm:flex-row">
              {nextModule.heroImage && (
                <div className="relative h-28 sm:h-auto sm:w-44 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover */}
                  <img src={nextModule.heroImage.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-surface via-surface/30 to-transparent" />
                </div>
              )}
              <div className="flex flex-1 flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">🔓 Unlocked · UC {nextModule.order}</p>
                  <p className="mt-0.5 font-display text-lg font-bold text-text">{nextModule.title}</p>
                  <p className="text-sm text-text-muted">{nextModule.description}</p>
                </div>
                <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-6 py-3 font-semibold text-[#04141c] shadow-[var(--shadow-glow-primary)] transition-colors group-hover:bg-primary-strong">
                  Next unit ▶
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ) : (
        !nextModule && (
          <Card className="p-5 text-center border-xp/40">
            <p className="text-3xl">⭐</p>
            <p className="font-display text-lg font-bold text-text">That was the final unit!</p>
            <p className="text-sm text-text-muted">Check your profile for every badge you&apos;ve earned.</p>
          </Card>
        )
      )}

      <div className="flex justify-center gap-4 text-sm font-semibold">
        <Link href="/lobby" className="text-text-muted hover:text-text">
          ◀ Lobby
        </Link>
        <Link href="/profile" className="text-text-muted hover:text-text">
          🏅 Achievements
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-text" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated/80 px-2 py-2">
      <div className={`font-mono-tabular text-base font-bold ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-text-faint">{label}</div>
    </div>
  );
}
