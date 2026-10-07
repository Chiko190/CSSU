import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getPracticalCheck, getTaskQuiz } from "@/core/content/loader";
import { getTasksForModule } from "@/core/content/tasks";
import { computeScene, stepIdsOf } from "@/core/content/missionGame";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { NetworkScene } from "@/components/game/NetworkScene";
import { APP_TITLE } from "@/lib/appName";

/** What kind of games each unit has, for the campaign cards. */
const UNIT_GAMES: Record<string, string[]> = {
  "module-1": ["🧰 3D PC teardown & rebuild", "🃏 Sequence & match games"],
  "module-2": ["🔌 3D T568B wire crimping", "🃏 Network setup sprint"],
  "module-3": ["🗺️ Domain-building missions", "⏱ Timed DHCP / DNS rush"],
  "module-4": ["💥 Data-rescue mission", "🛟 Backup & restore drill"],
};

const STEPS = [
  { icon: "📖", title: "Briefing", body: "Quick lesson cards on the essentials." },
  { icon: "✅", title: "Checklist", body: "Work through the real TESDA task sheet." },
  { icon: "🎮", title: "Game", body: "Prove it hands-on: 3D builds, missions, sprints." },
  { icon: "🧠", title: "Quiz", body: "15 questions -- streaks, hearts, no guessing." },
  { icon: "🏆", title: "Certificate", body: "Clear every task to earn the unit's certificate." },
];

const FEATURES = [
  { icon: "❤️", title: "Hearts", body: "Wrong moves cost a heart. They refill over time, so every answer counts." },
  { icon: "🔥", title: "Combos & streaks", body: "Chain right answers for combos, stars and faster clear times." },
  { icon: "⭐", title: "XP & levels", body: "Climb from Computer Rookie to CSS Master as you clear units." },
  { icon: "🏅", title: "Badges", body: "Unlock achievements like Sharpshooter, Domain Admin and NC II Ready." },
];

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] bg-primary px-7 py-3.5 text-base font-semibold text-[#04141c] shadow-[var(--shadow-glow-primary)] transition-all hover:bg-primary-strong active:scale-[0.98]";
const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] border border-border bg-surface-2 px-7 py-3.5 text-base font-semibold text-text transition-colors hover:border-primary/60 hover:text-primary";

export default async function LandingPage() {
  const user = await getServerSession();
  if (user) redirect("/lobby");

  const modules = [...(await getDataStore().listModules())].sort((a, b) => a.order - b.order);
  // Counted from the real content, so the hero numbers stay true as tasks and quizzes change.
  const allTasks = modules.flatMap((m) => getTasksForModule(m.id).map((t) => ({ moduleId: m.id, taskId: t.id })));
  const taskTotal = allTasks.length;
  const gameTotal = allTasks.filter((t) => getPracticalCheck(t.moduleId, t.taskId)).length;
  const questionTotal = allTasks.reduce((n, t) => n + (getTaskQuiz(t.moduleId, t.taskId)?.length ?? 0), 0);

  // A real frame from the UC3 mission game -- the actual map and scene code, three missions in --
  // so the hero shows the game itself rather than a mockup.
  const preview = getPracticalCheck("module-3", "task-1");
  const previewScene =
    preview?.kind === "mission-game" ? computeScene(preview, new Set(stepIdsOf(preview.missions.slice(0, 3)))) : null;

  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logomark className="h-8 w-8" />
          <span className="font-display text-sm font-bold text-text sm:text-base">CSS NC II Training Game</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="rounded-[var(--radius-full)] px-4 py-2 text-sm font-semibold text-text-muted hover:text-text">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-[var(--radius-full)] bg-primary px-4 py-2 text-sm font-semibold text-[#04141c] shadow-[var(--shadow-glow-primary)] hover:bg-primary-strong"
            >
              Play now
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.05fr]">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            🎮 A game-based reviewer for TESDA CSS NC II
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl">
            Train like a technician.
            <br />
            <span className="relative whitespace-nowrap text-primary">
              Level up like a gamer.
              <svg aria-hidden viewBox="0 0 300 12" className="absolute -bottom-1 left-0 w-full text-primary/60" preserveAspectRatio="none">
                <path d="M2 8.5C60 3 150 2 298 7.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-text-muted lg:mx-0">
            Build a PC in 3D, crimp a T568B cable, stand up a Windows domain and rescue lost files -- then prove it in quick
            quizzes. Every unit of Computer Systems Servicing, played instead of just read.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/register" className={PRIMARY_CTA}>
              🎮 Start playing -- it&apos;s free
            </Link>
            <Link href="/login" className={SECONDARY_CTA}>
              I have an account
            </Link>
          </div>
          <dl className="mt-8 flex justify-center gap-6 lg:justify-start">
            {[
              { k: `${modules.length}`, v: "units" },
              { k: `${taskTotal}`, v: "tasks" },
              { k: `${gameTotal}`, v: "games" },
              { k: `${questionTotal}`, v: "quiz Qs" },
            ].map((s) => (
              <div key={s.v} className="text-center lg:text-left">
                <dt className="font-display text-2xl font-bold text-text">{s.k}</dt>
                <dd className="text-xs uppercase tracking-wide text-text-faint">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Live game preview */}
        {previewScene && (
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_40%,rgba(79,209,255,0.18),transparent_70%)]" />
            <Card className="overflow-hidden p-0 shadow-[var(--shadow-glow-primary)]" aria-label="Preview of the UC3 mission game">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-xs font-semibold">
                <span className="font-display text-sm font-bold text-text">🎮 Operation css.org</span>
                <span className="flex gap-1">
                  {["✓", "✓", "✓", "4", "5", "6"].map((d, i) => (
                    <span
                      key={i}
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        d === "✓" ? "bg-success text-[#03140d]" : i === 3 ? "bg-primary text-[#04141c]" : "bg-surface-2 text-text-faint"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </span>
                <span className="ml-auto flex items-center gap-3 font-mono-tabular">
                  <span className="text-text-muted">⏱ 2:41</span>
                  <span className="text-xp">🔥 x4</span>
                  <span>❤️❤️❤️❤️🤍</span>
                </span>
              </div>
              <div className="border-y border-border-soft bg-bg-elevated">
                <NetworkScene scene={previewScene} speakerId="server" pulses={[]} />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-primary/50 bg-primary/10 text-xl">
                    🗄️
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      <span className="text-primary">SERVER</span> <span className="text-text-faint">· Assemble the Team · step 1/3</span>
                    </p>
                    <p className="font-semibold text-text">Right-click css.org &gt; New &gt; …?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {["Organizational Unit", "Group", "Shared Folder"].map((o, i) => (
                    <span
                      key={o}
                      className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm ${
                        i === 0 ? "border-primary bg-primary/15 text-text" : "border-border bg-bg-elevated text-text-muted"
                      }`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${i === 0 ? "bg-primary text-[#04141c]" : "bg-surface-2"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Campaign */}
      <section className="border-t border-border-soft bg-bg-elevated/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-primary">The campaign</p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold text-text">Four units. One technician.</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-text-muted">
            Each unit of competency is a stage -- clear one to unlock the next.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((m) => (
              <li key={m.id}>
                <Card className="flex h-full flex-col overflow-hidden p-0">
                  <div className="relative h-32 overflow-hidden">
                    {m.heroImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover
                      <img src={m.heroImage.url} alt="" title={m.heroImage.credit} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-md border border-border bg-bg/80 px-2 py-0.5 font-mono-tabular text-[11px] font-bold text-text backdrop-blur">
                      UC {m.order}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
                    <h3 className="font-display font-semibold leading-snug text-text">{m.title}</h3>
                    <p className="flex-1 text-sm text-text-muted">{m.description}</p>
                    <ul className="space-y-1 border-t border-border-soft pt-2">
                      {(UNIT_GAMES[m.id] ?? []).map((g) => (
                        <li key={g} className="text-xs text-text-muted">
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-primary">How every task works</p>
        <h2 className="mt-2 text-center font-display text-3xl font-bold text-text">Learn it. Do it. Play it. Prove it.</h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <Card className="h-full p-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-2xl">
                  {s.icon}
                </div>
                <p className="mt-3 font-mono-tabular text-[10px] text-text-faint">STEP {i + 1}</p>
                <p className="font-display font-semibold text-text">{s.title}</p>
                <p className="mt-1 text-xs text-text-muted">{s.body}</p>
              </Card>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-text-faint sm:block">
                  ▶
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="border-t border-border-soft bg-bg-elevated/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[var(--radius-lg)] border border-border-soft bg-surface/70 p-5">
              <p className="text-3xl" aria-hidden>
                {f.icon}
              </p>
              <p className="mt-3 font-display font-semibold text-text">{f.title}</p>
              <p className="mt-1 text-sm text-text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="relative overflow-hidden p-8 text-center sm:p-12">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,209,255,0.15),transparent_60%)]" />
          <div className="relative">
            <p className="text-4xl">🧑‍💻</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">Ready for your first build?</h2>
            <p className="mx-auto mt-2 max-w-md text-text-muted">Start at Level 1 as a Computer Rookie. Your progress saves as you go.</p>
            <Link href="/register" className={`${PRIMARY_CTA} mt-6`}>
              🎮 Start playing
            </Link>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <Logomark className="h-6 w-6" />
            <span className="text-sm font-semibold text-text-muted">CSS NC II Training Game</span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-text-faint">
            {APP_TITLE} is an independent educational preparation tool built around the TESDA Computer Systems Servicing NC
            II competency framework. It is not an official TESDA assessment and does not issue TESDA National Certificates
            -- completing it awards a Certificate of Completion.
          </p>
        </div>
      </footer>
    </main>
  );
}
