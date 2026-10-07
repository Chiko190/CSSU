"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import { getClientAuthProvider } from "@/core/auth/clientProvider";

/** `variant="tab"` renders it as an item of the phone bottom tab bar; the default is the compact
 * header button. */
export function SignOutButton({ variant = "header" }: { variant?: "header" | "tab" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      // Clears the app's session cookie and, for the Firebase provider, the
      // client SDK's own persisted auth state -- otherwise a later sign-in
      // could silently reuse the still-authenticated Google session.
      await Promise.all([apiFetch("/api/auth/signout", { method: "POST" }), getClientAuthProvider().signOut()]);
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (variant === "tab") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-text-faint cursor-pointer disabled:opacity-50"
      >
        <span className="text-lg" aria-hidden>
          🚪
        </span>
        {loading ? "…" : "Sign out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      title="Sign out"
      className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-text-muted transition-colors hover:bg-surface hover:text-text sm:inline-flex cursor-pointer disabled:opacity-50"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
