import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { submitTaskQuiz } from "@/core/progress/quizAttempt";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; taskId: string }> },
) {
  try {
    const { moduleId, taskId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const result = await submitTaskQuiz({ uid: user.uid, moduleId, taskId });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
