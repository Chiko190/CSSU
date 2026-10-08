"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LessonCard, LessonMedia } from "@/core/content/types";
import { PartViewer } from "@/3d/PartViewer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressDots } from "@/components/game/GameUi";
import { apiFetch } from "@/lib/fetcher";

/** The module briefing: a short deck of lesson cards in the same frame as the games (top bar with
 * card dots, the card, Back/Next). Finishing awards the lesson XP and returns to the module's quest
 * path -- it used to push to a /try route that no longer exists, which 404'd. */
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
      router.push(`/modules/${moduleId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  // Arrow keys flip cards, like a slideshow.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(cards.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  return (
    <Card className="relative overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <p className="font-display text-sm font-bold text-text">📖 Briefing</p>
        <ProgressDots labels={cards.map((c) => c.title)} isDone={(i) => i < index} activeIndex={index} />
        <span className="ml-auto text-xs font-semibold text-xp">+20 XP on finish</span>
      </div>

      <div
        key={card.id}
        className={`min-h-[220px] border-t border-border-soft p-6 sm:p-8 animate-game-pop ${
          card.media ? "grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center" : ""
        }`}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Card {index + 1} of {cards.length}
          </p>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-text">{card.title}</h2>
          <p className="mt-3 leading-relaxed text-text-muted">{card.body}</p>
        </div>
        {card.media && <LessonMediaView media={card.media} />}
      </div>

      {error && <p className="px-6 pb-2 text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between gap-3 border-t border-border-soft px-4 py-3 sm:px-6">
        <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          ◀ Back
        </Button>
        <span className="hidden sm:inline text-[11px] text-text-faint">← → to flip</span>
        {isLast ? (
          <Button onClick={handleFinish} disabled={submitting}>
            {submitting ? "Saving..." : "Finish briefing ✓"}
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}>Next ▶</Button>
        )}
      </div>
    </Card>
  );
}

function LessonMediaView({ media }: { media: LessonMedia }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border-soft bg-bg-elevated">
      {media.kind === "image" ? (
        <img src={media.url} alt={media.alt} className="block max-h-[300px] w-full object-contain" />
      ) : (
        <div className="relative h-[220px] sm:h-[260px] w-full" role="img" aria-label={media.alt}>
          <PartViewer shape={{ kind: "model", url: media.url }} rotation={media.rotation} />
        </div>
      )}
      {media.kind === "image" && media.credit && (
        <figcaption className="border-t border-border-soft px-3 py-1.5 text-[11px] text-text-faint">{media.credit}</figcaption>
      )}
      {media.kind === "model" && (
        <figcaption className="border-t border-border-soft px-3 py-1.5 text-[11px] text-text-faint">Drag to rotate · scroll to zoom</figcaption>
      )}
    </figure>
  );
}
