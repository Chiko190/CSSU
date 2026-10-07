"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { apiFetch } from "@/lib/fetcher";
import { PROVIDER } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { AuthError, AuthField, AuthShell, OrDivider } from "@/components/auth/AuthShell";

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
      const code = (err as { code?: string } | undefined)?.code;
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("We couldn't sign you in with that email and password. If you don't have an account yet, register first.");
      } else {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    } finally {
      setLoading(null);
    }
  }

  // In mock mode (no Firebase configured) email/Google sign-in can't work -- they'd only ever throw
  // "isn't available in mock mode". Lead with the demo login there instead of offering dead buttons.
  const mock = PROVIDER === "mock";

  const demoButton = (
    <Button variant={mock ? "primary" : "ghost"} size="lg" className="w-full" onClick={handleDemoSignIn} disabled={loading !== null}>
      {loading === "demo" ? "Connecting..." : "🎮 Play as Demo Learner"}
    </Button>
  );

  return (
    <AuthShell title="Welcome back, technician." subtitle="Sign in to continue your training run.">
      {mock && (
        <>
          {demoButton}
          <p className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2 text-xs text-text-faint">
            ℹ️ This copy runs in offline demo mode -- your progress is saved on this device. Email and Google sign-in turn
            on once Firebase is configured.
          </p>
        </>
      )}

      {!mock && (
        <>
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <AuthField
              id="email"
              label="Email"
              icon="✉️"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <AuthField
              id="password"
              label="Password"
              icon="🔒"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aside={
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              }
            />
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading !== null}>
              {loading === "email" ? "Signing in..." : "Sign in ▶"}
            </Button>
          </form>

          <OrDivider />

          <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogleSignIn} disabled={loading !== null}>
            {loading === "google" ? "Connecting..." : "Continue with Google"}
          </Button>
        </>
      )}

      <AuthError message={error} />

      <p className="text-center text-sm text-text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
