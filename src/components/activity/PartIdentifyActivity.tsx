"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGLTF } from "@react-three/drei";
import type { IdentifyPartActivityContent } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle, IconCheckCircle } from "@/components/ui/Icon";
import { apiFetch } from "@/lib/fetcher";

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic shuffle seeded from a string -- looks random per part but stays
 * identical between server and client render, avoiding a hydration mismatch. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let state = seed || 1;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PartIdentifyActivity({
  moduleId,
  activity,
}: {
  moduleId: string;
  activity: IdentifyPartActivityContent;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const part = activity.parts[index];
  const answered = selectedId !== null;
  const isCorrect = selectedId === part.id;
  const isLastPart = index === activity.parts.length - 1;
  const allAttempted = attemptedIds.size === activity.parts.length;

  const options = useMemo(() => {
    const pool = activity.parts.filter((p) => p.id !== part.id);
    const distractors = seededShuffle(pool, hashString(`${part.id}:distractors`)).slice(0, 3);
    return seededShuffle([part, ...distractors], hashString(`${part.id}:order`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part.id]);

  // Fetch the next part's model in the background while the player is still
  // looking at/answering the current one, so advancing feels instant instead
  // of showing a blank loading canvas every time.
  useEffect(() => {
    const next = activity.parts[index + 1];
    if (next?.shape.kind === "model") {
      useGLTF.preload(next.shape.url);
    }
  }, [index, activity.parts]);

  function handleSelect(optionId: string) {
    if (answered) return;
    setSelectedId(optionId);
    setAttemptedIds((prev) => new Set(prev).add(part.id));
    if (optionId === part.id) {
      setCorrectIds((prev) => new Set(prev).add(part.id));
    }
  }

  function handleNext() {
    setSelectedId(null);
    setIndex((i) => i + 1);
  }

  async function handleComplete() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/activities/${moduleId}/complete`, {
        method: "POST",
        body: JSON.stringify({ foundTargetIds: Array.from(attemptedIds) }),
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
          Part {index + 1} / {activity.parts.length} -- {correctIds.size} identified correctly
        </p>
      </Card>

      <div className="relative w-full h-[380px] sm:h-[440px] rounded-[var(--radius-lg)] overflow-hidden border border-border bg-bg-elevated">
        <PartViewer key={part.id} shape={part.shape} color={part.color} rotation={part.rotation} />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-text mb-3">What computer part is this?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => {
            const showCorrect = answered && opt.id === part.id;
            const showWrong = answered && selectedId === opt.id && opt.id !== part.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
                className={`px-4 py-3 rounded-[var(--radius-md)] border text-sm font-semibold text-left transition-colors ${
                  showCorrect
                    ? "border-success bg-success/10 text-success"
                    : showWrong
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-border bg-surface text-text hover:border-primary/60"
                } ${answered ? "cursor-default" : "cursor-pointer"}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Card>

      {answered && (
        <Card className={`p-5 ${isCorrect ? "border-success/40" : "border-warning/40 bg-warning/5"}`}>
          <h3 className="flex items-center gap-1.5 font-semibold text-text mb-1">
            {isCorrect ? (
              <IconCheckCircle className="h-4 w-4 text-success" />
            ) : (
              <IconAlertTriangle className="h-4 w-4 text-warning" />
            )}
            {isCorrect ? "Correct -- " : "Not quite -- "}
            {part.label}
          </h3>
          <p className="text-sm text-text-muted">{part.explanation}</p>
        </Card>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        {!isLastPart ? (
          <Button onClick={handleNext} disabled={!answered}>
            {answered ? "Next Part" : "Choose an answer to continue"}
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={!allAttempted || submitting}>
            {submitting
              ? "Saving..."
              : allAttempted
                ? "Complete Activity (+50 XP)"
                : "Choose an answer to continue"}
          </Button>
        )}
      </div>
    </div>
  );
}
