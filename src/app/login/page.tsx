"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthProvider } from "@/core/auth/provider";
import { apiFetch } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { APP_TITLE } from "@/lib/appName";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exchangeAndEnter(idToken: string) {
    await apiFetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    router.push("/lobby");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading("google");
    try {
      const { idToken } = await getAuthProvider().signInWithGoogle();
      await exchangeAndEnter(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3">
            <Logomark className="h-7 w-7 shrink-0" />
            <span>{APP_TITLE}</span>
          </div>
          <h1 className="text-3xl font-bold text-text">Welcome back, technician.</h1>
          <p className="mt-2 text-text-muted">
            Sign in to continue your Computer Systems Servicing training.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading !== null}
          >
            {loading === "google" ? "Connecting..." : "Continue with Google"}
          </Button>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-[var(--radius-md)] px-4 py-3">
              {error}
            </p>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-text-faint">
          {APP_TITLE} is an independent educational preparation tool. It is not
          an official TESDA assessment and does not issue TESDA National
          Certificates.
        </p>
      </div>
    </main>
  );
}
