import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getTaskQuiz, stripQuizAnswers } from "@/core/content/loader";
import { getOrCreateProgress } from "@/core/progress/completion";
import { getTaskQuizProgress } from "@/core/progress/quizAttempt";
import { getHearts } from "@/core/progress/hearts";
import { getHintBalance } from "@/core/progress/hints";
import { getTotalXp } from "@/core/progress/xp";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; taskId: string }> },
) {
  try {
    const { moduleId, taskId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const quiz = getTaskQuiz(moduleId, taskId);
    if (!quiz) {
      return NextResponse.json({ error: "No quiz content for this task" }, { status: 404 });
    }

    const [progress, hearts, hintBalance, totalXp] = await Promise.all([
      getOrCreateProgress(user.uid, moduleId),
      getHearts(user.uid),
      getHintBalance(user.uid),
      getTotalXp(user.uid),
    ]);
    const taskProgress = getTaskQuizProgress(progress, taskId);

    return NextResponse.json({
      questions: stripQuizAnswers(quiz),
      hearts,
      hintBalance,
      totalXp,
      hintUsedThisAttempt: taskProgress.hintUsedThisAttempt,
      answeredIds: taskProgress.currentAttempt?.answeredIds ?? [],
    });
  } catch (err) {
    return errorResponse(err);
  }
}
