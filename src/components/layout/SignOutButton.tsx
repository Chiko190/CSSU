"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { getClientAuthProvider } from "@/core/auth/clientProvider";

export function SignOutButton() {
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

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={loading}>
      {loading ? "..." : "Sign out"}
    </Button>
  );
}
