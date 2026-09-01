import Link from "next/link";
import type { ModuleMeta, ModuleStatus, UserModuleProgress } from "@/core/data/types";
import { getTasksForModule } from "@/core/content/tasks";
import { IconCheckCircle, IconLock } from "@/components/ui/Icon";

const STATUS_LABEL: Record<ModuleStatus, string> = {
  locked: "Locked",
  available: "Ready to start",
  "in-progress": "In progress",
  completed: "Completed",
};

export function ModuleCard({
  moduleMeta,
  status,
  progress,
  prerequisiteTitle,
}: {
  moduleMeta: ModuleMeta;
  status: ModuleStatus;
  progress: UserModuleProgress | null;
  prerequisiteTitle: string | null;
}) {
  const locked = status === "locked";
  const completed = status === "completed";
  const taskCount = getTasksForModule(moduleMeta.id).length;
  const passedQuizCount = progress ? Object.values(progress.taskQuizzes).filter((tq) => tq.passed).length : 0;

  const card = (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] border h-full flex flex-col transition-all ${
        locked
          ? "border-border-soft bg-surface/40 opacity-70"
          : completed
            ? "border-success/40 bg-surface hover:border-success/70"
            : "border-border bg-surface hover:border-primary/60 [box-shadow:var(--shadow-card)]"
      }`}
    >
      {moduleMeta.heroImage && (
        <div className="relative h-28 w-full shrink-0 overflow-hidden bg-bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element -- real reference photo, own aspect ratio, framed via object-cover */}
          <img
            src={moduleMeta.heroImage.url}
            alt=""
            title={moduleMeta.heroImage.credit}
            className={`h-full w-full object-cover ${locked ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
      )}

      <div className="relative p-5 flex flex-col gap-3 flex-1">
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -right-2 -top-5 z-0 text-[64px] font-bold leading-none text-text/[0.05] select-none"
        >
          {moduleMeta.order.toString().padStart(2, "0")}
        </span>

        <div className="relative z-10 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-text-faint">
              Module {moduleMeta.order.toString().padStart(2, "0")}
            </span>
            {locked && <IconLock className="h-4 w-4 text-text-faint" />}
            {completed && <IconCheckCircle className="h-4 w-4 text-success" />}
          </div>

          <h3 className={`font-display text-lg font-semibold ${locked ? "text-text-muted" : "text-text"}`}>
            {moduleMeta.title}
          </h3>
          <p className="text-sm text-text-muted flex-1">{moduleMeta.description}</p>

          {locked ? (
            <p className="text-xs text-text-faint">
              Complete &ldquo;{prerequisiteTitle}&rdquo; to unlock
            </p>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span
                className={
                  completed
                    ? "text-success font-semibold"
                    : status === "in-progress"
                      ? "text-primary font-semibold"
                      : "text-text-muted"
                }
              >
                {STATUS_LABEL[status]}
              </span>
              {progress && passedQuizCount > 0 && (
                <span className="text-text-faint">
                  {passedQuizCount}/{taskCount} quizzes passed
                </span>
              )}
            </div>
          )}
        </div>
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
