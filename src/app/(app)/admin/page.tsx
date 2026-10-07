import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { isAdminEmail } from "@/core/auth/admin";
import { getDataStore } from "@/core/data/store";
import { getPracticalCheck, getTaskQuiz } from "@/core/content/loader";
import { getTasksForModule } from "@/core/content/tasks";
import { LEVELS } from "@/core/progress/xp";
import { HEARTS_MAX, PASS_THRESHOLD, XP_VALUES } from "@/core/progress/constants";
import { Card } from "@/components/ui/Card";
import { AdminHeartsSettingsForm } from "@/components/admin/AdminHeartsSettingsForm";

const XP_LABELS: Record<keyof typeof XP_VALUES, string> = {
  lesson: "Finish a briefing",
  activity: "Finish a module's checklists",
  quiz_pass: "Pass a task quiz",
  quiz_perfect_bonus: "Perfect quiz bonus",
  module_complete: "Complete a unit",
};

export default async function AdminPage() {
  const user = await getServerSession();
  if (!user || !isAdminEmail(user.email)) redirect("/lobby");

  const store = getDataStore();
  const [settings, modulesMeta] = await Promise.all([store.getSettings(), store.listModules()]);
  const heartRefillIntervalSeconds = Math.round(settings.heartRefillIntervalMs / 1000);
  const heartsMax = settings.heartsMax ?? HEARTS_MAX;

  // Content overview, counted from the real content registry.
  const modules = [...modulesMeta].sort((a, b) => a.order - b.order);
  const rows = modules.map((m) => {
    const tasks = getTasksForModule(m.id);
    return {
      meta: m,
      tasks: tasks.length,
      steps: tasks.reduce((n, t) => n + t.itemIds.length, 0),
      games: tasks.filter((t) => getPracticalCheck(m.id, t.id)).length,
      questions: tasks.reduce((n, t) => n + (getTaskQuiz(m.id, t.id)?.length ?? 0), 0),
    };
  });
  const sum = (k: "tasks" | "steps" | "games" | "questions") => rows.reduce((n, r) => n + r[k], 0);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-accent/50 bg-accent/10 text-2xl">
          🛠️
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-text">Admin console</h1>
          <p className="truncate text-sm text-text-muted">Signed in as {user.email}</p>
        </div>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">Trainer access</span>
      </div>

      {/* Content overview */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon="🗺️" label="Units" value={modules.length} />
        <Stat icon="📋" label="Tasks" value={sum("tasks")} sub={`${sum("steps")} checklist steps`} />
        <Stat icon="🎮" label="Games" value={sum("games")} />
        <Stat icon="🧠" label="Quiz questions" value={sum("questions")} />
      </div>

      {/* Hearts */}
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            ❤️
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-text">Hearts</h2>
            <p className="text-sm text-text-muted">
              How forgiving the games and quizzes are. Changes apply to every learner immediately.
            </p>
          </div>
        </div>
        <AdminHeartsSettingsForm initialSeconds={heartRefillIntervalSeconds} initialHeartsMax={heartsMax} />
      </Card>

      {/* Content table */}
      <Card className="p-5 sm:p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-text">Content by unit</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-faint">
                <th className="pb-2 pr-3 font-semibold">Unit</th>
                <th className="pb-2 pr-3 text-right font-semibold">Tasks</th>
                <th className="pb-2 pr-3 text-right font-semibold">Steps</th>
                <th className="pb-2 pr-3 text-right font-semibold">Games</th>
                <th className="pb-2 text-right font-semibold">Questions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {rows.map((r) => (
                <tr key={r.meta.id}>
                  <td className="py-2 pr-3">
                    <span className="mr-2 rounded border border-border px-1.5 py-0.5 font-mono-tabular text-[10px] font-bold text-text-muted">
                      UC{r.meta.order}
                    </span>
                    <span className="text-text">{r.meta.title}</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-tabular text-text-muted">{r.tasks}</td>
                  <td className="py-2 pr-3 text-right font-mono-tabular text-text-muted">{r.steps}</td>
                  <td className="py-2 pr-3 text-right font-mono-tabular text-text-muted">{r.games}</td>
                  <td className="py-2 text-right font-mono-tabular text-text-muted">{r.questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rules reference */}
      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-text">Game rules</h2>
        <p className="mb-4 text-sm text-text-muted">Read-only -- set in code, shown here for reference.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">XP rewards</p>
            <ul className="space-y-1.5 text-sm">
              {(Object.keys(XP_VALUES) as (keyof typeof XP_VALUES)[]).map((k) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="text-text-muted">{XP_LABELS[k]}</span>
                  <span className="font-mono-tabular font-semibold text-xp">+{XP_VALUES[k]}</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-border-soft pt-1.5">
                <span className="text-text-muted">Quiz pass mark</span>
                <span className="font-mono-tabular font-semibold text-text">{PASS_THRESHOLD}%</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">Levels</p>
            <ol className="space-y-1.5 text-sm">
              {LEVELS.map((l) => (
                <li key={l.level} className="flex justify-between gap-3">
                  <span className="text-text-muted">
                    <span className="font-semibold text-xp">LVL {l.level}</span> · {l.name}
                  </span>
                  <span className="font-mono-tabular text-text">{l.minXp} XP</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>
    </main>
  );
}

function Stat({ icon, label, value, sub }: { icon: string; label: string; value: number; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xl" aria-hidden>
        {icon}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-text">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-text-faint">{label}</p>
      {sub && <p className="text-[11px] text-text-faint">{sub}</p>}
    </Card>
  );
}
