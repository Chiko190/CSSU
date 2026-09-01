"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";

export function AdminHeartsSettingsForm({ initialSeconds }: { initialSeconds: number }) {
  const [minutes, setMinutes] = useState(Math.floor(initialSeconds / 60));
  const [seconds, setSeconds] = useState(initialSeconds % 60);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const totalSeconds = minutes * 60 + seconds;
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ heartRefillIntervalSeconds: totalSeconds }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
            Minutes
          </span>
          <input
            type="number"
            min={0}
            max={1440}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
            className="w-24 px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
            Seconds
          </span>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-24 px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
          />
        </label>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && !error && <p className="text-sm text-success">Saved -- applies to every learner immediately.</p>}
    </div>
  );
}
