import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getOrCreateProgress } from "@/core/progress/completion";
import { getDataStore } from "@/core/data/store";
import { canCompletePracticalItem, getPracticalCheck } from "@/core/content/loader";
import { getTaskQuizProgress } from "@/core/progress/quizAttempt";
import { getTask, isTaskUnlockedForProgress } from "@/core/content/tasks";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

const bodySchema = z.object({ itemId: z.string() });

/** Persists one completed step of a task's quiz-gating practical check (see
 * module-1/practicalCheck.ts) -- called once per step so a mid-sequence refresh resumes where
 * the learner left off instead of restarting the whole thing. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; taskId: string }> },
) {
  try {
    const { moduleId, taskId } = await params;
    const user = await requireServerSession();
    await assertModuleUnlocked(user.uid, moduleId);

    const practicalCheck = getPracticalCheck(moduleId, taskId);
    if (!practicalCheck) {
      return NextResponse.json({ error: "No practical check for this task" }, { status: 404 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Never trust a client-submitted id blindly -- only accept ids that are actually part of
    // this task's practical check.
    if (!practicalCheck.items.some((s) => s.id === parsed.data.itemId)) {
      return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    }

    const progress = await getOrCreateProgress(user.uid, moduleId);
    // Same gate as the quiz page: the game only opens once the task is unlocked and its own
    // checklist is finished, so a direct API call can't play it out of turn.
    const task = getTask(moduleId, taskId);
    const checklist = new Set(progress.activityCheckedIds);
    if (!task || !isTaskUnlockedForProgress(moduleId, taskId, progress) || !task.itemIds.every((id) => checklist.has(id))) {
      return NextResponse.json({ error: "Finish this task's checklist first" }, { status: 400 });
    }
    const alreadyChecked = new Set(progress.practicalCheckedIds[taskId] ?? []);
    // The client only ever offers the next step, but the order is the whole test -- re-check it
    // here so a direct API call can't skip ahead.
    if (!canCompletePracticalItem(practicalCheck, alreadyChecked, parsed.data.itemId)) {
      return NextResponse.json({ error: "Complete the earlier steps first" }, { status: 400 });
    }
    const checkedIds = new Set([...alreadyChecked, parsed.data.itemId]);
    const finished = practicalCheck.items.every((item) => checkedIds.has(item.id));
    await getDataStore().upsertModuleProgress({
      ...progress,
      practicalCheckedIds: { ...progress.practicalCheckedIds, [taskId]: Array.from(checkedIds) },
      // Ties this playthrough to the quiz attempt it unlocks -- see replayPracticalCheckIfStale.
      ...(finished && {
        practicalCheckAttempt: {
          ...progress.practicalCheckAttempt,
          [taskId]: getTaskQuizProgress(progress, taskId).attemptCount,
        },
      }),
    });

    return NextResponse.json({ checkedIds: Array.from(checkedIds) });
  } catch (err) {
    return errorResponse(err);
  }
}
