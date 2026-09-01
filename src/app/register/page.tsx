"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientAuthProvider } from "@/core/auth/clientProvider";
import { apiFetch } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logomark } from "@/components/ui/Logomark";
import { APP_TITLE } from "@/lib/appName";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { idToken } = await getClientAuthProvider().registerWithEmail(email, password, displayName.trim());
      await apiFetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      router.push("/lobby");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <h1 className="text-3xl font-bold text-text">Create your account</h1>
          <p className="mt-2 text-text-muted">Start your Computer Systems Servicing training.</p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
                Nickname
              </label>
              <input
                id="displayName"
                type="text"
                required
                maxLength={24}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
                placeholder="Your nickname"
              />
            </div>
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
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-xs text-text-faint">
            Already have an account? <Link href="/login" className="font-semibold text-primary">Sign in</Link>
          </p>

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
