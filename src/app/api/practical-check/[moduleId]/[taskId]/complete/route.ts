import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { assertModuleUnlocked } from "@/core/progress/unlock";
import { getOrCreateProgress } from "@/core/progress/completion";
import { getDataStore } from "@/core/data/store";
import { getPracticalCheck } from "@/core/content/loader";
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

    const steps = getPracticalCheck(moduleId, taskId);
    if (!steps) {
      return NextResponse.json({ error: "No practical check for this task" }, { status: 404 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Never trust a client-submitted id blindly -- only accept ids that are actually part of
    // this task's practical check.
    if (!steps.some((s) => s.id === parsed.data.itemId)) {
      return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    }

    const progress = await getOrCreateProgress(user.uid, moduleId);
    const checkedIds = new Set([...(progress.practicalCheckedIds[taskId] ?? []), parsed.data.itemId]);
    await getDataStore().upsertModuleProgress({
      ...progress,
      practicalCheckedIds: { ...progress.practicalCheckedIds, [taskId]: Array.from(checkedIds) },
    });

    return NextResponse.json({ checkedIds: Array.from(checkedIds) });
  } catch (err) {
    return errorResponse(err);
  }
}
