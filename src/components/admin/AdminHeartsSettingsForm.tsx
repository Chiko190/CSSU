"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";

// Must match the PATCH /api/admin/settings schema -- validated here too so a bad value is caught
// inline instead of coming back as a raw 400 (the old form happily submitted "0 min 0 sec").
const MIN_SECONDS = 5;
const MAX_SECONDS = 86_400;
const MIN_HEARTS = 1;
const MAX_HEARTS = 20;

const PRESETS = [
  { label: "30 s", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
];

function describe(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : "", s ? `${s} s` : ""].filter(Boolean).join(" ");
}

const clampInt = (v: string, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.floor(Number(v) || 0)));

const INPUT =
  "w-20 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 py-2 text-sm text-text font-mono-tabular focus:border-primary/70 focus:outline-none";

export function AdminHeartsSettingsForm({ initialSeconds, initialHeartsMax }: { initialSeconds: number; initialHeartsMax: number }) {
  const [saved, setSaved] = useState({ seconds: initialSeconds, heartsMax: initialHeartsMax });
  const [minutes, setMinutes] = useState(Math.floor(initialSeconds / 60));
  const [seconds, setSeconds] = useState(initialSeconds % 60);
  const [heartsMax, setHeartsMax] = useState(initialHeartsMax);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const totalSeconds = minutes * 60 + seconds;
  const intervalError =
    totalSeconds < MIN_SECONDS
      ? `Refill time must be at least ${MIN_SECONDS} seconds.`
      : totalSeconds > MAX_SECONDS
        ? "Refill time can't be longer than 24 hours."
        : null;
  const dirty = totalSeconds !== saved.seconds || heartsMax !== saved.heartsMax;

  function setTotal(s: number) {
    setMinutes(Math.floor(s / 60));
    setSeconds(s % 60);
    setJustSaved(false);
  }

  function undo() {
    setTotal(saved.seconds);
    setHeartsMax(saved.heartsMax);
    setError(null);
  }

  async function handleSave() {
    if (intervalError) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ heartRefillIntervalSeconds: totalSeconds, heartsMax }),
      });
      setSaved({ seconds: totalSeconds, heartsMax });
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Max hearts */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">Max hearts</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border">
            <button
              type="button"
              onClick={() => {
                setHeartsMax((h) => Math.max(MIN_HEARTS, h - 1));
                setJustSaved(false);
              }}
              disabled={heartsMax <= MIN_HEARTS}
              className="h-10 w-10 bg-surface-2 text-lg font-bold text-text hover:bg-primary/15 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="One fewer heart"
            >
              −
            </button>
            <input
              type="number"
              min={MIN_HEARTS}
              max={MAX_HEARTS}
              value={heartsMax}
              onChange={(e) => {
                setHeartsMax(clampInt(e.target.value, MIN_HEARTS, MAX_HEARTS));
                setJustSaved(false);
              }}
              aria-label="Max hearts"
              className="h-10 w-14 border-x border-border bg-bg-elevated text-center font-mono-tabular text-sm text-text focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setHeartsMax((h) => Math.min(MAX_HEARTS, h + 1));
                setJustSaved(false);
              }}
              disabled={heartsMax >= MAX_HEARTS}
              className="h-10 w-10 bg-surface-2 text-lg font-bold text-text hover:bg-primary/15 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="One more heart"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-0.5 text-lg" aria-hidden>
            {Array.from({ length: heartsMax }, (_, i) => (
              <span key={i}>❤️</span>
            ))}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-text-faint">
          Shared pool every learner starts with ({MIN_HEARTS}–{MAX_HEARTS}). Each wrong answer or wrong move costs one.
        </p>
      </div>

      {/* Refill time */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">Refill time (per heart)</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              onClick={() => setTotal(p.seconds)}
              aria-pressed={totalSeconds === p.seconds}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                totalSeconds === p.seconds
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2 text-text-muted hover:border-primary/50 hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span>Custom:</span>
          <input
            type="number"
            min={0}
            max={1440}
            value={minutes}
            onChange={(e) => {
              setMinutes(clampInt(e.target.value, 0, 1440));
              setJustSaved(false);
            }}
            aria-label="Minutes"
            className={INPUT}
          />
          <span>min</span>
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => {
              setSeconds(clampInt(e.target.value, 0, 59));
              setJustSaved(false);
            }}
            aria-label="Seconds"
            className={INPUT}
          />
          <span>sec</span>
        </div>
        {intervalError ? (
          <p className="mt-2 text-xs font-semibold text-danger">⚠ {intervalError}</p>
        ) : (
          <p className="mt-2 text-xs text-text-faint">
            ⏱ 1 heart every <span className="font-semibold text-text">{describe(totalSeconds)}</span> · empty to full in{" "}
            <span className="font-semibold text-text">{describe(totalSeconds * heartsMax)}</span>
          </p>
        )}
      </div>

      {/* Save bar */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-4">
        <span className="text-xs" aria-live="polite">
          {error ? (
            <span className="font-semibold text-danger">{error}</span>
          ) : justSaved && !dirty ? (
            <span className="font-semibold text-success">✓ Saved -- applies to every learner right away.</span>
          ) : dirty ? (
            <span className="font-semibold text-warning">● Unsaved changes</span>
          ) : (
            <span className="text-text-faint">No changes</span>
          )}
        </span>
        <div className="ml-auto flex gap-2">
          {dirty && (
            <Button variant="ghost" size="sm" onClick={undo} disabled={saving}>
              Undo
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty || Boolean(intervalError)}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
