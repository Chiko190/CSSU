"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { apiFetch } from "@/lib/fetcher";
import { PROVIDER } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { APP_TITLE } from "@/lib/appName";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "demo" | "email" | null>(null);
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
      const { idToken } = await getClientAuthProvider().signInWithGoogle();
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
      const { idToken } = await getClientAuthProvider().signInAsDemoUser();
      await exchangeAndEnter(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const { idToken } = await getClientAuthProvider().signInWithEmail(email, password);
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
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-text-faint">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading !== null}>
              {loading === "email" ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-text-faint">
            No account? <Link href="/register" className="font-semibold text-primary">Register</Link>
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-faint">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading !== null}
          >
            {loading === "google" ? "Connecting..." : "Continue with Google"}
          </Button>

          {PROVIDER === "mock" && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={handleDemoSignIn}
              disabled={loading !== null}
            >
              {loading === "demo" ? "Connecting..." : "Continue as Demo Learner"}
            </Button>
          )}

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
