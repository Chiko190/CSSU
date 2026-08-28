import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getOrCreateProgress, evaluateAndMaybeCompleteModule } from "@/core/progress/completion";
import { awardXp } from "@/core/progress/xp";
import { XP_VALUES } from "@/core/progress/constants";
import { getDataStore } from "@/core/data/store";
import { getModuleContent, getActivityRequiredIds } from "@/core/content/loader";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

const bodySchema = z.object({ foundTargetIds: z.array(z.string()) });

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
      return NextResponse.json({ error: "No activity content for this module" }, { status: 404 });
    }

    // Server re-checks that every required component was actually found --
    // never trusts a bare client "I'm done" flag.
    const requiredIds = getActivityRequiredIds(content.activity);
    const foundIds = new Set(parsed.data.foundTargetIds);
    const allFound = requiredIds.every((id) => foundIds.has(id));
    if (!allFound) {
      return NextResponse.json(
        { error: "Not all required components were identified yet" },
        { status: 400 },
      );
    }

    const store = getDataStore();
    let progress = await getOrCreateProgress(user.uid, moduleId);

    const xpEvent = await awardXp({
      uid: user.uid,
      moduleId,
      type: "activity",
      amount: XP_VALUES.activity,
    });

    if (!progress.activityCompletedAt) {
      progress = {
        ...progress,
        activityCompletedAt: Date.now(),
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
