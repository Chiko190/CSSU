import Link from "next/link";
import type { AuthUser } from "@/core/auth/types";
import type { LevelInfo } from "@/core/progress/xp";
import { Logomark } from "@/components/ui/Logomark";
import { Avatar } from "@/components/ui/Avatar";
import { APP_TITLE } from "@/lib/appName";
import { SignOutButton } from "./SignOutButton";

export function AppHeader({ user, level }: { user: AuthUser; level: LevelInfo }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/lobby"
          title={APP_TITLE}
          className="flex items-center gap-2 font-display font-semibold text-text min-w-0 flex-1 sm:flex-initial sm:max-w-xs"
        >
          <Logomark className="h-6 w-6 shrink-0" />
          <span className="truncate text-xs sm:text-sm leading-tight">{APP_TITLE}</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm shrink-0">
          <Link
            href="/lobby"
            className="px-3 py-2 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface"
          >
            Lobby
          </Link>
          <Link
            href="/profile"
            className="px-3 py-2 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface"
          >
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-xp">
              LVL {level.level} &mdash; {level.name}
            </span>
            <span className="text-[11px] text-text-faint">{level.totalXp} XP</span>
          </div>
          <Link href="/profile" title="Edit profile">
            <Avatar
              photoURL={user.photoURL}
              displayName={user.displayName}
              className="h-8 w-8 text-base"
            />
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
