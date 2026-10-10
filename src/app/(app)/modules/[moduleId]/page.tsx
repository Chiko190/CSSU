import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getPracticalCheck } from "@/core/content/loader";
import { summarizeModuleProgress, type TaskState } from "@/core/progress/taskStates";
import { BackLink } from "@/components/module/BackLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { IconDownload } from "@/components/ui/Icon";
import { AssemblyModelsPreloader } from "@/3d/AssemblyModelsPreloader";
import { Certificate } from "@/components/certificate/Certificate";

const GUIDE_FILES: Record<string, string> = {
  "module-1": "guide.pdf",
  "module-2": "guide.docx",
  "module-3": "guide.docx",
  "module-4": "guide.docx",
};

/** What kind of game gates each task's quiz -- shown as a tag on the quest path. */
function gameTag(moduleId: string, taskId: string): string | null {
  const check = getPracticalCheck(moduleId, taskId);
  if (!check) return null;
  if (check.kind === "assembly" || check.kind === "wire-order") return "🎮 3D game";
  return `🎮 ${check.missions.length} missions`;
}

export default async function ModuleTasksPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  const progress = await store.getModuleProgress(user.uid, moduleId);
  const summary = summarizeModuleProgress(moduleId, progress);
  const guideFile = GUIDE_FILES[moduleId];

  return (
    <div className="space-y-6">
      {/* Task 1's 3D scene is the heaviest thing in this module -- start fetching its models the
       * moment the learner reaches this page, so the scene is already cached by the time they tap in. */}
      {moduleId === "module-1" && <AssemblyModelsPreloader />}

      <BackLink href="/lobby" label="Lobby" />

      {/* Hero banner */}
      <Card className="relative overflow-hidden p-0">
        {moduleMeta.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover
          <img src={moduleMeta.heroImage.url} alt="" title={moduleMeta.heroImage.credit} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/40" />
        <div className="relative space-y-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-bg/70 px-2 py-0.5 font-mono-tabular text-[11px] font-bold text-text">
              UC {moduleMeta.order}
            </span>
            {summary.complete && (
              <span className="rounded-full border border-success/50 bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">✓ Complete</span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">{moduleMeta.title}</h1>
          <p className="max-w-xl text-sm text-text-muted">{moduleMeta.description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex min-w-[200px] flex-1 items-center gap-2">
              <ProgressBar value={summary.pct} />
              <span className="shrink-0 font-mono-tabular text-xs text-text-muted">
                {summary.doneCount}/{summary.tasks.length} tasks
              </span>
            </div>
            {guideFile && (
              <a
                href={`/modules/${moduleId}/${guideFile}`}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/60 px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary/60 hover:text-text transition-colors"
              >
                <IconDownload className="h-3.5 w-3.5" /> Module guide
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Quest path: briefing -> tasks -> certificate, joined by a line */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-text">Quest path</h2>
        <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-0.5 before:bg-border-soft">
          <QuestNode
            marker={summary.lessonDone ? "✓" : "📖"}
            tone={summary.lessonDone ? "done" : summary.next?.href.endsWith("/learn") ? "current" : "open"}
            href={`/modules/${moduleId}/learn`}
            kicker="Briefing"
            title="Learn the basics"
            meta={summary.lessonDone ? "Read ✓ · replay anytime" : "Quick lesson cards · +20 XP"}
            cta={summary.lessonDone ? "Replay" : "Read ▶"}
          />

          {summary.tasks.map((state) => (
            <TaskNode key={state.task.id} moduleId={moduleId} state={state} />
          ))}

          <QuestNode
            marker="🏆"
            tone={summary.complete ? "done" : "locked"}
            kicker="Reward"
            title="Module certificate"
            meta={summary.complete ? "Earned -- download it below" : "Finish every task to unlock"}
          />
        </ol>
      </div>

      {summary.complete && (
        <div className="flex flex-col items-center gap-3">
          <Certificate moduleTitle={moduleMeta.title} playerName={user.displayName} />
        </div>
      )}
    </div>
  );
}

function TaskNode({ moduleId, state }: { moduleId: string; state: TaskState }) {
  const tag = gameTag(moduleId, state.task.id);
  const { phase } = state;
  const marker = phase === "done" ? "✓" : phase === "locked" ? "🔒" : phase === "quiz" ? "🧠" : String(state.number);
  const meta =
    phase === "locked"
      ? "Finish the task above to unlock"
      : phase === "done"
        ? `Quiz best ${state.bestScorePct ?? 100}%`
        : phase === "quiz"
          ? tag
            ? "Checklist done -- game + quiz next"
            : "Checklist done -- quiz next"
          : `${state.checkedCount}/${state.stepCount} checklist steps`;
  const cta = phase === "locked" ? undefined : phase === "done" ? "Review" : phase === "quiz" ? "Play ▶" : state.checkedCount > 0 ? "Continue ▶" : "Start ▶";

  return (
    <QuestNode
      marker={marker}
      tone={phase === "done" ? "done" : phase === "locked" ? "locked" : state.current ? "current" : "open"}
      href={phase === "locked" ? undefined : state.href}
      kicker={`Task ${state.number}`}
      title={state.task.title}
      meta={meta}
      tag={tag}
      cta={cta}
      progress={phase === "checklist" && state.stepCount > 0 ? (state.checkedCount / state.stepCount) * 100 : undefined}
    />
  );
}

type Tone = "done" | "current" | "open" | "locked";

function QuestNode({
  marker,
  tone,
  href,
  kicker,
  title,
  meta,
  tag,
  cta,
  progress,
}: {
  marker: string;
  tone: Tone;
  href?: string;
  kicker: string;
  title: string;
  meta: ReactNode;
  tag?: string | null;
  cta?: string;
  progress?: number;
}) {
  const markerCls =
    tone === "done"
      ? "border-success bg-success text-[#03140d]"
      : tone === "current"
        ? "border-primary bg-primary text-[#04141c] shadow-[var(--shadow-glow-primary)]"
        : tone === "locked"
          ? "border-border bg-surface text-text-faint"
          : "border-primary/50 bg-surface text-primary";
  const cardCls =
    tone === "current"
      ? "border-primary/60 shadow-[var(--shadow-glow-primary)]"
      : tone === "done"
        ? "border-success/30"
        : tone === "locked"
          ? "border-border-soft opacity-60"
          : "border-border";

  const body = (
    <div
      className={`flex flex-1 items-center gap-3 rounded-[var(--radius-lg)] border bg-surface px-4 py-3 transition-all ${cardCls} ${
        href ? "group-hover:-translate-y-0.5 group-hover:border-primary/70" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-wide">
          <span className={tone === "current" ? "text-primary" : "text-text-faint"}>{kicker}</span>
          {tone === "current" && <span className="text-primary">· you are here</span>}
          {tag && <span className="rounded-full bg-accent/15 px-1.5 normal-case tracking-normal text-accent">{tag}</span>}
        </p>
        <p className={`font-semibold ${tone === "locked" ? "text-text-muted" : "text-text"}`}>{title}</p>
        <p className="text-xs text-text-faint">{meta}</p>
        {progress !== undefined && <ProgressBar value={progress} className="mt-1.5 h-1.5 max-w-[220px]" />}
      </div>
      {cta && (
        <span className={`shrink-0 text-sm font-semibold ${tone === "done" ? "text-success" : "text-primary"}`}>{cta}</span>
      )}
    </div>
  );

  return (
    <li className="relative flex items-center gap-3">
      <span
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${markerCls}`}
        aria-hidden
      >
        {marker}
      </span>
      {href ? (
        <Link href={href} className="group flex flex-1">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
