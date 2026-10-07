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
    <Card className="p-4 sm:p-5 border-danger/30 bg-danger/[0.03]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-danger">⚠️ Danger zone</h2>
          <p className="text-xs text-text-muted">
            Resets every module&apos;s progress, XP, level, badges, and quiz history to zero. Your account, nickname, and
            photo are kept.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={resetting}
          className="border border-danger/50 text-danger hover:bg-danger/10 hover:text-danger"
        >
          {resetting ? "Resetting..." : "Reset all progress"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
