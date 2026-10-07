"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { APP_TITLE } from "@/lib/appName";

const STAGES = [
  { icon: "🖥️", label: "UC1 · Build a PC" },
  { icon: "🌐", label: "UC2 · Wire a LAN" },
  { icon: "🗄️", label: "UC3 · Run a server" },
  { icon: "💾", label: "UC4 · Rescue data" },
];

const PERKS = [
  { icon: "🎮", text: "3D builds, wiring games and network missions" },
  { icon: "🧠", text: "Quick quizzes with streaks and hearts" },
  { icon: "🏆", text: "XP, levels, badges and certificates" },
];

/** Shared two-panel layout for the sign-in / register / reset pages: a game-style intro panel
 * (short title, the four units as stages, what you get) beside the form card. Stacks on phones,
 * where the intro collapses to just the logo and title so the form stays above the fold. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    // Fills exactly one screen (100dvh = 100vh minus mobile browser chrome) with the content centered
    // in it; taller content (tiny phones) still grows and scrolls instead of being clipped.
    <main className="flex min-h-dvh flex-1 items-center justify-center px-4 py-4 sm:px-6">
      <div className="grid w-full max-w-4xl items-center gap-6 lg:grid-cols-[1fr_420px] lg:gap-10">
        <section className="text-center lg:text-left">
          <div className="inline-flex items-center gap-3">
            <Logomark className="h-12 w-12 sm:h-14 sm:w-14" />
            <div className="text-left">
              <p className="font-display text-lg font-bold leading-tight text-text sm:text-xl">CSS NC II Training Game</p>
              <p className="text-xs font-semibold text-primary">Computer Systems Servicing</p>
            </div>
          </div>

          <div className="hidden lg:block">
            <h2 className="mt-8 font-display text-3xl font-bold leading-tight text-text">
              Train like a technician.
              <br />
              <span className="text-primary">Level up</span> like a gamer.
            </h2>
            <ol className="mt-6 grid grid-cols-2 gap-2">
              {STAGES.map((s, i) => (
                <li key={s.label} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border-soft bg-surface/60 px-3 py-2">
                  <span className="text-xl" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="text-sm text-text-muted">
                    <span className="font-mono-tabular text-[10px] text-text-faint">0{i + 1} </span>
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
            <ul className="mt-5 space-y-2">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-2.5 text-sm text-text-muted">
                  <span aria-hidden>{p.icon}</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div>
          {/* Kept compact so the whole sign-in area fits one screen even with the full email +
              Google form (the live Firebase mode is taller than demo mode). */}
          <Card className="p-5 sm:p-6">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-text">{title}</h1>
            <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
            <div className="mt-4 space-y-3">{children}</div>
          </Card>
          <p className="mt-2 text-center text-[10px] text-text-faint" title={APP_TITLE}>
            Independent study tool -- not an official TESDA assessment or National Certificate.
          </p>
        </div>
      </div>
    </main>
  );
}

/** Labelled input with a leading icon; `type="password"` gets a show/hide toggle. */
export function AuthField({
  id,
  label,
  icon,
  type = "text",
  aside,
  ...props
}: { id: string; label: string; icon: string; aside?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-text-faint">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" aria-hidden>
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated py-2 pl-9 text-sm text-text placeholder:text-text-faint transition-colors focus:border-primary/70 focus:outline-none focus:shadow-[var(--shadow-glow-primary)] ${
            isPassword ? "pr-16" : "pr-3"
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-text-muted hover:text-text cursor-pointer"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="animate-game-pop rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-text-faint">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
