"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/fetcher";
import { HINT_COST_XP, HINT_MAX_STACK } from "@/core/progress/constants";

export function HintShop({ balance: initialBalance, totalXp: initialTotalXp }: { balance: number; totalXp: number }) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const full = balance >= HINT_MAX_STACK;
  const canAfford = totalXp >= HINT_COST_XP;

  async function handleBuy() {
    setBuying(true);
    setError(null);
    try {
      const result = await apiFetch<{ balance: number; totalXp: number }>("/api/hints/buy", { method: "POST" });
      setBalance(result.balance);
      setTotalXp(result.totalXp);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't buy a hint");
    } finally {
      setBuying(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-text">Quiz Hints</h2>
          <p className="mt-1 text-sm text-text-muted max-w-md">
            Spend {HINT_COST_XP} XP to bank a hint charge (up to {HINT_MAX_STACK}). Only one charge can be used
            per quiz attempt -- it eliminates a wrong choice on a multiple-choice question. It costs real XP, so
            it comes out of your level.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-1" aria-label={`${balance} of ${HINT_MAX_STACK} hint charges`}>
            {Array.from({ length: HINT_MAX_STACK }, (_, i) => (
              <span key={i} className={`text-xl ${i < balance ? "" : "opacity-20 grayscale"}`}>
                💡
              </span>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={handleBuy} disabled={buying || full || !canAfford}>
            {buying ? "Buying..." : full ? "Stack full" : `Buy (${HINT_COST_XP} XP)`}
          </Button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {!full && !canAfford && !error && (
        <p className="mt-3 text-xs text-text-faint">
          You have {totalXp} XP -- need {HINT_COST_XP - totalXp} more to buy a hint.
        </p>
      )}
    </Card>
  );
}
