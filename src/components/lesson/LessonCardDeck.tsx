"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LessonCard } from "@/core/content/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";

export function LessonCardDeck({ moduleId, cards }: { moduleId: string; cards: LessonCard[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = cards[index];
  const isLast = index === cards.length - 1;

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/lessons/${moduleId}/complete`, { method: "POST" });
      router.push(`/modules/${moduleId}/try`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        {cards.map((c, i) => (
          <div
            key={c.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? "bg-primary" : "bg-surface-2"}`}
          />
        ))}
      </div>

      <Card className="p-6 sm:p-8 min-h-[220px] flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
          {index + 1} / {cards.length}
        </p>
        <h2 className="text-xl font-bold text-text mb-3">{card.title}</h2>
        <p className="text-text-muted leading-relaxed">{card.body}</p>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </Button>
        {isLast ? (
          <Button onClick={handleFinish} disabled={submitting}>
            {submitting ? "Saving..." : "Finish Lesson (+20 XP)"}
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}>Next</Button>
        )}
      </div>
    </div>
  );
}
