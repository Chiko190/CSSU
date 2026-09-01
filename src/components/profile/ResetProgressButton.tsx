"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";

export function ResetProgressButton() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    if (!window.confirm("Reset all progress? This clears every module's progress, XP, level, and quiz history. Your account stays.")) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await apiFetch("/api/profile/reset", { method: "POST" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset your progress");
    } finally {
      setResetting(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8 border-danger/30">
      <h2 className="text-lg font-semibold text-text mb-1">Danger Zone</h2>
      <p className="text-sm text-text-muted mb-4">
        Resets every module&apos;s progress, XP, level, and quiz history back to zero. Your account,
        nickname, and photo are kept.
      </p>
      <Button variant="secondary" onClick={handleReset} disabled={resetting}>
        {resetting ? "Resetting..." : "Reset all progress"}
      </Button>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
