"use client";

import { useState } from "react";
import Link from "next/link";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { Button } from "@/components/ui/Button";
import { AuthError, AuthField, AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await getClientAuthProvider().sendPasswordReset(email);
      // Always show success, whether or not the email exists -- standard practice, and Firebase's
      // sendPasswordResetEmail doesn't distinguish that itself either.
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to set a new one.">
      {sent ? (
        <p className="animate-game-pop rounded-[var(--radius-md)] border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          📬 If an account exists for {email}, a password reset email is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset email"}
          </Button>
        </form>
      )}

      <AuthError message={error} />

      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          ◀ Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
