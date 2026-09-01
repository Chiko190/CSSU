"use client";

import { useState } from "react";
import Link from "next/link";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { APP_TITLE } from "@/lib/appName";

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
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3">
            <Logomark className="h-7 w-7 shrink-0" />
            <span>{APP_TITLE}</span>
          </div>
          <h1 className="text-3xl font-bold text-text">Reset your password</h1>
          <p className="mt-2 text-text-muted">We&apos;ll email you a link to set a new one.</p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {sent ? (
            <p className="text-sm text-success bg-success/10 border border-success/30 rounded-[var(--radius-md)] px-4 py-3">
              If an account exists for {email}, a password reset email is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
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
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset email"}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-text-faint">
            <Link href="/login" className="font-semibold text-primary">Back to sign in</Link>
          </p>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-[var(--radius-md)] px-4 py-3">
              {error}
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
