import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getModuleContent } from "@/core/content/loader";
import { getDataStore } from "@/core/data/store";
import { getOrCreateProgress, evaluateAndMaybeCompleteModule } from "@/core/progress/completion";
import { awardXp } from "@/core/progress/xp";
import { PASS_THRESHOLD, XP_VALUES } from "@/core/progress/constants";
import { errorResponse } from "@/lib/routeHelpers";
import type { QuizAttempt } from "@/core/data/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  answers: z.record(z.string(), z.array(z.string())),
});

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const content = getModuleContent(moduleId);
    if (!content) {
      return NextResponse.json({ error: "No quiz content for this module" }, { status: 404 });
    }

    // Grade only against the canonical question set -- the answer key never
    // left the server, so this is the first point at which correctness exists.
    const validQuestionIds = new Set(content.quiz.map((q) => q.id));
    for (const qid of Object.keys(parsed.data.answers)) {
      if (!validQuestionIds.has(qid)) {
        return NextResponse.json({ error: `Unknown question: ${qid}` }, { status: 400 });
      }
    }

    const perQuestionResult = content.quiz.map((q) => {
      const submitted = parsed.data.answers[q.id] ?? [];
      const correct = sameSet(submitted, q.correctOptionIds);
      return {
        questionId: q.id,
        correct,
        correctOptionIds: q.correctOptionIds,
        explanation: q.explanation,
      };
    });

    const correctCount = perQuestionResult.filter((r) => r.correct).length;
    const scorePct = Math.round((correctCount / content.quiz.length) * 100);
    const passed = scorePct >= PASS_THRESHOLD;
    const perfect = scorePct === 100;

    const store = getDataStore();
    const attempt: QuizAttempt = {
      id: randomUUID(),
      uid: user.uid,
      moduleId,
      submittedAt: Date.now(),
      answers: parsed.data.answers,
      scorePct,
      passed,
      perfect,
    };
    await store.recordQuizAttempt(attempt);

    const xpAwarded: { type: string; amount: number }[] = [];

    if (passed) {
      const passEvent = await awardXp({
        uid: user.uid,
        moduleId,
        type: "quiz_pass",
        amount: XP_VALUES.quiz_pass,
      });
      if (passEvent) xpAwarded.push({ type: passEvent.type, amount: passEvent.amount });
    }
    if (passed && perfect) {
      const bonusEvent = await awardXp({
        uid: user.uid,
        moduleId,
        type: "quiz_perfect_bonus",
        amount: XP_VALUES.quiz_perfect_bonus,
      });
      if (bonusEvent) xpAwarded.push({ type: bonusEvent.type, amount: bonusEvent.amount });
    }

    let progress = await getOrCreateProgress(user.uid, moduleId);
    progress = {
      ...progress,
      bestQuizScorePct: Math.max(progress.bestQuizScorePct ?? 0, scorePct),
      quizAttemptCount: progress.quizAttemptCount + 1,
      status: progress.status === "available" ? "in-progress" : progress.status,
    };
    await store.upsertModuleProgress(progress);
    progress = await evaluateAndMaybeCompleteModule(progress);

    return NextResponse.json({
      scorePct,
      passed,
      perfect,
      xpAwarded,
      perQuestionResult,
      progress,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
