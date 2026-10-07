"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicHeartsState } from "@/core/progress/hearts";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

function isActive(pathname: string, href: string) {
  // Module pages live under /modules but belong to the Lobby tab.
  if (href === "/lobby") return pathname === "/lobby" || pathname.startsWith("/modules");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop nav pills with the current section highlighted. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              active ? "bg-primary/15 text-primary" : "text-text-muted hover:bg-surface hover:text-text"
            }`}
          >
            <span aria-hidden className="mr-1">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Phone-only bottom tab bar -- the desktop nav is hidden on small screens, and without this there
 * was no way to reach Profile or Admin there at all. */
export function MobileTabBar({ items, onSignOut }: { items: NavItem[]; onSignOut?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-primary" : "text-text-faint"}`}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        {onSignOut && <li className="flex-1">{onSignOut}</li>}
      </ul>
    </nav>
  );
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** ❤️ current/max, plus a live "+1 in m:ss" countdown while refilling. When the countdown runs out
 * it refreshes the server-rendered layout once, so the new heart shows up without a reload. */
export function HeartsPill({ hearts }: { hearts: PublicHeartsState }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const refreshedFor = useRef<number | null>(null);
  const refillAt = hearts.current < hearts.max ? hearts.nextRefillAt : null;

  useEffect(() => {
    if (refillAt === null) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= refillAt && refreshedFor.current !== refillAt) {
        refreshedFor.current = refillAt;
        router.refresh();
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [refillAt, router]);

  const empty = hearts.current <= 0;
  return (
    <span
      key={hearts.current}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-mono-tabular animate-game-pop ${
        empty ? "border-danger/60 bg-danger/10 text-danger" : "border-border bg-surface text-text"
      }`}
      title={`${hearts.current} of ${hearts.max} hearts`}
      aria-label={`${hearts.current} of ${hearts.max} hearts`}
    >
      <span aria-hidden>{empty ? "💔" : "❤️"}</span>
      {hearts.current}/{hearts.max}
      {refillAt !== null && now !== null && (
        <span className="hidden font-normal text-text-faint md:inline" suppressHydrationWarning>
          · +1 in {formatCountdown(refillAt - now)}
        </span>
      )}
    </span>
  );
}
