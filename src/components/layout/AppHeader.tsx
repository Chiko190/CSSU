import Link from "next/link";
import type { AuthUser } from "@/core/auth/types";
import type { LevelInfo } from "@/core/progress/xp";
import { Logomark } from "@/components/ui/Logomark";
import { SignOutButton } from "./SignOutButton";

export function AppHeader({ user, level }: { user: AuthUser; level: LevelInfo }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/lobby" className="flex items-center gap-2 font-display font-semibold text-text shrink-0">
          <Logomark className="h-6 w-6" />
          ByteForge
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
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

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-xp">
              LVL {level.level} &mdash; {level.name}
            </span>
            <span className="text-[11px] text-text-faint">{level.totalXp} XP</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-semibold text-text overflow-hidden shrink-0">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              user.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
