import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getTaskQuiz } from "@/core/content/loader";
import { consumeHint } from "@/core/progress/hints";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

const bodySchema = z.object({ questionId: z.string().min(1) });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; taskId: string }> },
) {
  try {
    const { moduleId, taskId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const quiz = getTaskQuiz(moduleId, taskId);
    const question = quiz?.find((q) => q.id === parsed.data.questionId);
    if (!question) {
      return NextResponse.json({ error: "Unknown question" }, { status: 404 });
    }

    // A true/false question only has 2 options -- eliminating one just hands over the
    // answer outright, so hints aren't offered there at all.
    const incorrectOptionIds = question.options
      .map((o) => o.id)
      .filter((id) => !question.correctOptionIds.includes(id));
    if (incorrectOptionIds.length < 2) {
      return NextResponse.json({ error: "No hint available for this question" }, { status: 400 });
    }

    const result = await consumeHint(user.uid, moduleId, taskId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const eliminatedOptionId = incorrectOptionIds[Math.floor(Math.random() * incorrectOptionIds.length)];
    return NextResponse.json({ balance: result.balance, eliminatedOptionId });
  } catch (err) {
    return errorResponse(err);
  }
}
