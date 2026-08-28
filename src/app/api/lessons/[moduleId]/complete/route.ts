import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getOrCreateProgress, evaluateAndMaybeCompleteModule } from "@/core/progress/completion";
import { awardXp } from "@/core/progress/xp";
import { XP_VALUES } from "@/core/progress/constants";
import { getDataStore } from "@/core/data/store";
import { getModuleContent } from "@/core/content/loader";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    // Matches the same guard on the activity and quiz completion routes --
    // don't award lesson XP for a module with no actual lesson content.
    if (!getModuleContent(moduleId)) {
      return NextResponse.json({ error: "No lesson content for this module" }, { status: 404 });
    }

    const store = getDataStore();
    let progress = await getOrCreateProgress(user.uid, moduleId);

    const xpEvent = await awardXp({
      uid: user.uid,
      moduleId,
      type: "lesson",
      amount: XP_VALUES.lesson,
    });

    if (!progress.lessonCompletedAt) {
      progress = {
        ...progress,
        lessonCompletedAt: Date.now(),
        status: progress.status === "available" ? "in-progress" : progress.status,
      };
      await store.upsertModuleProgress(progress);
    }

    progress = await evaluateAndMaybeCompleteModule(progress);

    return NextResponse.json({ progress, xpAwarded: xpEvent?.amount ?? 0 });
  } catch (err) {
    return errorResponse(err);
  }
}
