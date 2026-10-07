import Link from "next/link";
import type { ModuleMeta, ModuleStatus } from "@/core/data/types";
import type { ModuleProgressSummary } from "@/core/progress/taskStates";
import { ProgressBar } from "@/components/ui/ProgressBar";

/** One unit of competency in the lobby's campaign grid: hero photo with a "UC n" stage badge, a
 * status chip, progress through its tasks, and a clear call to action (or what unlocks it). */
export function ModuleCard({
  moduleMeta,
  status,
  summary,
  prerequisiteTitle,
}: {
  moduleMeta: ModuleMeta;
  status: ModuleStatus;
  summary: ModuleProgressSummary;
  prerequisiteTitle: string | null;
}) {
  const locked = status === "locked";
  const completed = status === "completed";
  const started = !completed && (summary.lessonDone || summary.tasks.some((t) => t.checkedCount > 0));

  const chip = locked
    ? { text: "🔒 Locked", cls: "border-border bg-bg/70 text-text-faint" }
    : completed
      ? { text: "✓ Complete", cls: "border-success/50 bg-success/15 text-success" }
      : started
        ? { text: "▶ In progress", cls: "border-primary/50 bg-primary/15 text-primary" }
        : { text: "★ New", cls: "border-xp/50 bg-xp/15 text-xp" };

  const cta = locked ? null : completed ? "Review ✓" : started ? "Continue ▶" : "Start ▶";

  const card = (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border transition-all ${
        locked
          ? "border-border-soft bg-surface/40"
          : completed
            ? "border-success/40 bg-surface hover:-translate-y-0.5 hover:border-success/70"
            : "border-border bg-surface [box-shadow:var(--shadow-card)] hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[var(--shadow-glow-primary)]"
      }`}
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-bg-elevated">
        {moduleMeta.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element -- real reference photo, framed via object-cover
          <img
            src={moduleMeta.heroImage.url}
            alt=""
            title={moduleMeta.heroImage.credit}
            className={`h-full w-full object-cover transition-transform duration-500 ${locked ? "grayscale opacity-40" : "group-hover:scale-105"}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md border border-border bg-bg/80 px-2 py-0.5 font-mono-tabular text-[11px] font-bold text-text backdrop-blur">
          UC {moduleMeta.order}
        </span>
        <span className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur ${chip.cls}`}>
          {chip.text}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 pt-3">
        <h3 className={`font-display text-lg font-semibold leading-snug ${locked ? "text-text-muted" : "text-text"}`}>
          {moduleMeta.title}
        </h3>
        <p className={`flex-1 text-sm ${locked ? "text-text-faint" : "text-text-muted"}`}>{moduleMeta.description}</p>

        {locked ? (
          <p className="mt-1 rounded-[var(--radius-md)] border border-dashed border-border px-3 py-2 text-xs text-text-faint">
            🔒 Finish &ldquo;{prerequisiteTitle}&rdquo; to unlock
          </p>
        ) : (
          <div className="mt-1 space-y-2">
            <div className="flex items-center gap-2">
              <ProgressBar value={summary.pct} />
              <span className="shrink-0 font-mono-tabular text-[11px] text-text-faint">
                {summary.doneCount}/{summary.tasks.length} tasks
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs text-text-faint">
                {completed ? "Certificate earned 🏆" : summary.next ? `Next: ${summary.next.label}` : ""}
              </span>
              <span className={`shrink-0 text-sm font-semibold ${completed ? "text-success" : "text-primary"}`}>{cta}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (locked) {
    return (
      <div aria-disabled="true" className="h-full cursor-not-allowed">
        {card}
      </div>
    );
  }

  return (
    <Link href={`/modules/${moduleMeta.id}`} className="block h-full">
      {card}
    </Link>
  );
}
