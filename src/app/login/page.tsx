"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVIDER } from "@/lib/env";
import { getAuthProvider } from "@/core/auth/provider";
import { apiFetch } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";

export default function LoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState<"google" | "demo" | null>(null);
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

  async function handleDemoSignIn() {
    setError(null);
    setLoading("demo");
    try {
      const { idToken } = await getAuthProvider().signInAsDemoUser(
        displayName.trim() || undefined,
      );
      await exchangeAndEnter(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase mb-3">
            <Logomark className="h-7 w-7" />
            ByteForge
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

          {PROVIDER === "mock" && (
            <>
              <div className="flex items-center gap-3 text-xs text-text-faint">
                <div className="h-px flex-1 bg-border" />
                or try it now
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-3">
                <label className="block text-sm text-text-muted" htmlFor="displayName">
                  What should we call you?
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Demo Learner"
                  className="w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-text placeholder:text-text-faint focus:border-primary outline-none"
                  maxLength={40}
                />
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={handleDemoSignIn}
                  disabled={loading !== null}
                >
                  {loading === "demo" ? "Signing in..." : "Continue as Demo User"}
                </Button>
                <p className="text-xs text-text-faint text-center">
                  No Google account needed. This app is running with the mock auth
                  provider -- progress is saved to this device only.
                </p>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-[var(--radius-md)] px-4 py-3">
              {error}
            </p>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-text-faint">
          ByteForge is an independent educational preparation tool. It is not an
          official TESDA assessment and does not issue TESDA National Certificates.
        </p>
      </div>
    </main>
  );
}
