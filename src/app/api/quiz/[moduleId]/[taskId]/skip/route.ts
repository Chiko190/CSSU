import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { skipTaskQuizQuestion } from "@/core/progress/quizAttempt";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

const bodySchema = z.object({
  questionId: z.string().min(1),
});

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

    const result = await skipTaskQuizQuestion({
      uid: user.uid,
      moduleId,
      taskId,
      questionId: parsed.data.questionId,
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
