"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { apiFetch } from "@/lib/fetcher";
import { PROVIDER } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { AuthError, AuthField, AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"register" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock mode (no Firebase configured) can't create real accounts -- registerWithEmail only ever
  // throws there -- so offer the demo login instead of a form that always fails.
  const mock = PROVIDER === "mock";

  async function enter(idToken: string, nickname?: string) {
    await apiFetch("/api/auth/session", { method: "POST", body: JSON.stringify({ idToken }) });
    // The session route only takes the provider's name for a brand-new user -- so a demo learner
    // who already played on this device would otherwise silently keep their old nickname.
    if (nickname) await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify({ displayName: nickname }) });
    router.push("/lobby");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("register");
    try {
      const { idToken } = await getClientAuthProvider().registerWithEmail(email, password, displayName.trim());
      await enter(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleDemo() {
    setError(null);
    setLoading("demo");
    try {
      const nickname = displayName.trim();
      const { idToken } = await getClientAuthProvider().signInAsDemoUser(nickname || undefined);
      await enter(idToken, nickname || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  const passwordOk = password.length >= 6;

  return (
    <AuthShell title="Create your technician" subtitle="Pick a nickname and start at Level 1.">
      {mock ? (
        <>
          <AuthField
            id="displayName"
            label="Nickname"
            icon="👤"
            maxLength={24}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
          />
          <Button size="md" className="w-full" onClick={handleDemo} disabled={loading !== null}>
            {loading === "demo" ? "Starting..." : "🎮 Start playing"}
          </Button>
          <p className="rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2 text-xs text-text-faint">
            ℹ️ Offline demo mode: progress is saved on this device. Email accounts turn on once Firebase is configured.
          </p>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <AuthField
            id="displayName"
            label="Nickname"
            icon="👤"
            required
            maxLength={24}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
          />
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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            aside={
              password.length > 0 && (
                <span className={`text-xs font-semibold ${passwordOk ? "text-success" : "text-warning"}`}>
                  {passwordOk ? "✓ Good to go" : `${6 - password.length} more`}
                </span>
              )
            }
          />
          <Button type="submit" size="md" className="w-full" disabled={loading !== null}>
            {loading === "register" ? "Creating account..." : "Create account ▶"}
          </Button>
        </form>
      )}

      <AuthError message={error} />

      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
