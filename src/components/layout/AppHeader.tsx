import Link from "next/link";
import type { AuthUser } from "@/core/auth/types";
import type { LevelInfo } from "@/core/progress/xp";
import type { PublicHeartsState } from "@/core/progress/hearts";
import { Logomark } from "@/components/ui/Logomark";
import { Avatar } from "@/components/ui/Avatar";
import { APP_TITLE } from "@/lib/appName";
import { SignOutButton } from "./SignOutButton";
import { HeartsPill, MobileTabBar, NavLinks, type NavItem } from "./HeaderClient";

/** The in-app HUD: short brand, section nav (highlighted), live hearts with refill countdown, level
 * badge with a mini XP bar, and the avatar. On phones the nav moves to a bottom tab bar. Sits above
 * the games' in-card overlays (z-40) so they never slide over it while scrolling. */
export function AppHeader({
  user,
  level,
  hearts,
  isAdmin,
}: {
  user: AuthUser;
  level: LevelInfo;
  hearts: PublicHeartsState;
  isAdmin: boolean;
}) {
  const nav: NavItem[] = [
    { href: "/lobby", label: "Lobby", icon: "🗺️" },
    { href: "/profile", label: "Profile", icon: "🏅" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "🛠️" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/lobby" title={APP_TITLE} aria-label="Go to Lobby" className="flex shrink-0 items-center gap-2">
            <Logomark className="h-8 w-8" />
            <span className="hidden font-display text-sm font-bold leading-tight text-text lg:block">
              CSS NC II
              <span className="block text-[10px] font-semibold text-primary">Training Game</span>
            </span>
          </Link>

          <NavLinks items={nav} />

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <HeartsPill hearts={hearts} />

            <Link
              href="/profile"
              title={`${level.totalXp} XP total`}
              className="group flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-xp/50"
            >
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-xp px-1 font-display text-xs font-bold text-[#1a1400]">
                {level.level}
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-[11px] font-semibold text-xp">{level.name}</span>
                <span className="mt-0.5 block h-1 w-20 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <span className="block h-full rounded-full bg-xp" style={{ width: `${level.progressPct}%` }} />
                </span>
              </span>
              <span className="text-[11px] font-mono-tabular text-text-faint sm:hidden">{level.totalXp} XP</span>
            </Link>

            <Link href="/profile" title="Your profile" aria-label="Your profile" className="shrink-0">
              <Avatar photoURL={user.photoURL} displayName={user.displayName} className="h-8 w-8 text-base ring-2 ring-border hover:ring-primary/60" />
            </Link>

            <SignOutButton />
          </div>
        </div>
      </header>

      <MobileTabBar items={nav} onSignOut={<SignOutButton variant="tab" />} />
    </>
  );
}
