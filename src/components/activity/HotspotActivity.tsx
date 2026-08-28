"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HotspotActivityContent, HotspotTarget } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

export function HotspotActivity({
  moduleId,
  activity,
}: {
  moduleId: string;
  activity: HotspotActivityContent;
}) {
  const router = useRouter();
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<HotspotTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allFound = foundIds.size === activity.targets.length;

  function handleHotspotClick(target: HotspotTarget) {
    setSelected(target);
    if (!foundIds.has(target.id)) {
      setFoundIds((prev) => new Set(prev).add(target.id));
    }
  }

  async function handleComplete() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/activities/${moduleId}/complete`, {
        method: "POST",
        body: JSON.stringify({ foundTargetIds: Array.from(foundIds) }),
      });
      router.push(`/modules/${moduleId}/check`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-sm text-text-muted">{activity.instructions}</p>
        <p className="mt-1 text-xs text-text-faint">
          {foundIds.size} / {activity.targets.length} identified
        </p>
      </Card>

      <div
        className="relative w-full rounded-[var(--radius-lg)] overflow-hidden border border-border select-none"
        style={{ aspectRatio: "800 / 450" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activity.baseImageUrl}
          alt="A desktop computer setup with labeled clickable regions"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        {activity.targets.map((target) => {
          const [x, y, w, h] = target.coords;
          const found = foundIds.has(target.id);
          return (
            <button
              key={target.id}
              type="button"
              onClick={() => handleHotspotClick(target)}
              aria-label={found ? `${target.label} (identified)` : `Identify: ${target.label}`}
              className={`absolute rounded-[var(--radius-sm)] border-2 transition-colors cursor-pointer ${
                found
                  ? "border-success bg-success/15"
                  : "border-primary/70 bg-primary/5 hover:bg-primary/20 animate-pulse"
              }`}
              style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
            >
              {found && (
                <IconCheckCircle className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-bg text-success" />
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <Card className="p-5 border-primary/40">
          <h3 className="font-semibold text-text mb-1">{selected.label}</h3>
          <p className="text-sm text-text-muted">{selected.explanation}</p>
        </Card>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={!allFound || submitting}>
          {submitting
            ? "Saving..."
            : allFound
              ? "Complete Activity (+50 XP)"
              : `Find all ${activity.targets.length} parts to continue`}
        </Button>
      </div>
    </div>
  );
}
