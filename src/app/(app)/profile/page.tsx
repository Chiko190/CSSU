import Link from "next/link";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { getModuleStatus } from "@/core/progress/unlock";
import { summarizeModuleProgress } from "@/core/progress/taskStates";
import { computeAchievements } from "@/core/progress/achievements";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ResetProgressButton } from "@/components/profile/ResetProgressButton";

export default async function ProfilePage() {
  const user = await getServerSession();
  if (!user) return null;

  const store = getDataStore();
  const [progressRows, modulesMeta, totalXp, xpEvents] = await Promise.all([
    store.getUserProgress(user.uid),
    store.listModules(),
    getTotalXp(user.uid),
    store.listXpEvents(user.uid),
  ]);

  const level = computeLevel(totalXp);
  const modules = [...modulesMeta].sort((a, b) => a.order - b.order);
  const progressById = new Map(progressRows.map((p) => [p.moduleId, p]));
  const rows = await Promise.all(
    modules.map(async (meta) => {
      const progress = progressById.get(meta.id) ?? null;
      const status = (await getModuleStatus(user.uid, meta.id)).status;
      return { meta, status, summary: summarizeModuleProgress(meta.id, progress) };
    }),
  );

  const tasksDone = rows.reduce((n, r) => n + r.summary.doneCount, 0);
  const tasksTotal = rows.reduce((n, r) => n + r.summary.tasks.length, 0);
  const perfects = xpEvents.filter((e) => e.type === "quiz_perfect_bonus").length;
  const achievements = computeAchievements({ progressRows, xpEvents, moduleIds: modules.map((m) => m.id), level: level.level });
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <main className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
      {/* Player card */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Avatar photoURL={user.photoURL} displayName={user.displayName} className="h-20 w-20 text-4xl" />
            <span className="absolute -bottom-1 -right-1 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-surface bg-xp px-1 font-display text-xs font-bold text-[#1a1400]">
              {level.level}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-text">{user.displayName}</h1>
            <p className="text-sm font-semibold text-xp">
              LVL {level.level} · {level.name}
            </p>
            <div className="mt-2 max-w-sm">
              <ProgressBar value={level.progressPct} />
              <p className="mt-1 text-xs text-text-faint">
                {level.xpForNextLevel
                  ? `${level.xpForNextLevel - level.xpIntoLevel} XP to LVL ${level.level + 1}`
                  : "Max level reached"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Total XP" value={level.totalXp.toLocaleString()} accent="text-xp" />
          <Stat label="Units done" value={`${rows.filter((r) => r.summary.complete).length}/${rows.length}`} />
          <Stat label="Tasks done" value={`${tasksDone}/${tasksTotal}`} />
          <Stat label="Perfect quizzes" value={`🎯 ${perfects}`} />
        </div>

        <div className="mt-4 border-t border-border-soft pt-4">
          <ProfileEditor displayName={user.displayName} photoURL={user.photoURL} />
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-lg font-bold text-text">Achievements</h2>
          <span className="font-mono-tabular text-xs text-text-faint">
            {earnedCount}/{achievements.length} unlocked
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {achievements.map((a) => (
            <li
              key={a.id}
              title={a.description}
              className={`flex flex-col items-center gap-1 rounded-[var(--radius-md)] border px-2 py-3 text-center ${
                a.earned ? "border-xp/40 bg-xp/10" : "border-border-soft bg-bg-elevated"
              }`}
            >
              <span className={`text-3xl ${a.earned ? "" : "opacity-30 grayscale"}`} aria-hidden>
                {a.icon}
              </span>
              <span className={`text-sm font-semibold ${a.earned ? "text-text" : "text-text-muted"}`}>{a.title}</span>
              <span className="text-[11px] leading-tight text-text-faint">{a.description}</span>
              <span className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${a.earned ? "text-xp" : "text-text-faint"}`}>
                {a.earned ? "★ Unlocked" : a.progress ? `🔒 ${a.progress}` : "🔒 Locked"}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Campaign progress -- every unit, not just the started ones */}
      <Card className="p-5 sm:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-text">Campaign progress</h2>
        <ul className="space-y-2">
          {rows.map(({ meta, status, summary }) => {
            const locked = status === "locked";
            const chip = locked
              ? { text: "🔒 Locked", cls: "text-text-faint border-border" }
              : summary.complete
                ? { text: "✓ Complete", cls: "text-success border-success/40 bg-success/10" }
                : summary.doneCount > 0 || summary.lessonDone
                  ? { text: "▶ In progress", cls: "text-primary border-primary/40 bg-primary/10" }
                  : { text: "★ Ready", cls: "text-xp border-xp/40 bg-xp/10" };
            const row = (
              <div
                className={`flex items-center gap-3 rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2.5 transition-colors ${
                  locked ? "opacity-60" : "hover:border-primary/60"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface font-mono-tabular text-xs font-bold text-text">
                  UC{meta.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{meta.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar value={summary.pct} className="max-w-[200px]" />
                    <span className="font-mono-tabular text-[11px] text-text-faint">
                      {summary.doneCount}/{summary.tasks.length}
                    </span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${chip.cls}`}>{chip.text}</span>
              </div>
            );
            return (
              <li key={meta.id}>
                {locked ? (
                  row
                ) : (
                  <Link href={`/modules/${meta.id}`} className="block">
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <ResetProgressButton />
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
