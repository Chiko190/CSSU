import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getModuleContent, stripQuizAnswers } from "@/core/content/loader";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const content = getModuleContent(moduleId);
    if (!content) {
      return NextResponse.json({ error: "No quiz content for this module" }, { status: 404 });
    }

    return NextResponse.json({ questions: stripQuizAnswers(content.quiz) });
  } catch (err) {
    return errorResponse(err);
  }
}
