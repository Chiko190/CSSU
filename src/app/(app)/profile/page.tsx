import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { getHintBalance } from "@/core/progress/hints";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { HintShop } from "@/components/profile/HintShop";
import type { ModuleStatus } from "@/core/data/types";

const STATUS_STYLES: Record<ModuleStatus, string> = {
  completed: "bg-success/15 text-success border-success/30",
  "in-progress": "bg-primary/15 text-primary border-primary/30",
  available: "bg-surface-2 text-text-muted border-border",
  locked: "bg-surface-2 text-text-faint border-border",
};

export default async function ProfilePage() {
  const user = await getServerSession();
  if (!user) return null;

  const store = getDataStore();
  const [progressRows, modulesMeta, totalXp, hintBalance] = await Promise.all([
    store.getUserProgress(user.uid),
    store.listModules(),
    getTotalXp(user.uid),
    getHintBalance(user.uid),
  ]);

  const level = computeLevel(totalXp);
  const metaById = new Map(modulesMeta.map((m) => [m.id, m]));
  const sortedProgress = [...progressRows].sort(
    (a, b) => (metaById.get(a.moduleId)?.order ?? 0) - (metaById.get(b.moduleId)?.order ?? 0),
  );

  return (
    <main className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
      <Card className="p-6 sm:p-8 flex items-center gap-5">
        <Avatar photoURL={user.photoURL} displayName={user.displayName} className="h-16 w-16 text-3xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text truncate">{user.displayName}</h1>
          <p className="text-sm text-xp font-semibold">
            LVL {level.level} &mdash; {level.name}
          </p>
          <div className="mt-2 max-w-xs">
            <ProgressBar value={level.progressPct} />
            <p className="mt-1 text-xs text-text-faint">
              {level.totalXp} XP total
              {level.xpForNextLevel
                ? ` — ${level.xpForNextLevel - level.xpIntoLevel} XP to next level`
                : " — max level reached"}
            </p>
          </div>
        </div>
      </Card>

      <ProfileEditor displayName={user.displayName} photoURL={user.photoURL} />

      <HintShop balance={hintBalance} totalXp={totalXp} />

      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text mb-4">Module Progress</h2>
        {sortedProgress.length === 0 ? (
          <p className="text-sm text-text-muted">
            No modules started yet &mdash; head to the lobby to begin Module 1.
          </p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {sortedProgress.map((p) => {
              const meta = metaById.get(p.moduleId);
              return (
                <li key={p.moduleId} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{meta?.title ?? p.moduleId}</p>
                    <p className="text-xs text-text-faint">
                      {p.quizAttemptCount} quiz attempt{p.quizAttemptCount === 1 ? "" : "s"}
                      {p.bestQuizScorePct != null ? ` — best score ${p.bestQuizScorePct}%` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-full)] border ${STATUS_STYLES[p.status]}`}
                  >
                    {p.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text mb-2">Achievements</h2>
        <p className="text-sm text-text-muted">
          Coming soon &mdash; badges will appear here as you progress.
        </p>
      </Card>
    </main>
  );
}
