import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/core/auth/admin";
import { getDataStore } from "@/core/data/store";
import { errorResponse } from "@/lib/routeHelpers";
import { HEARTS_MAX } from "@/core/progress/constants";

export const runtime = "nodejs";

const bodySchema = z.object({
  // Keep the refill interval within a sane range -- a few seconds to a full day -- so a typo
  // can't accidentally lock every learner out of quizzes for a week or make hearts meaningless.
  heartRefillIntervalSeconds: z.number().int().min(5).max(86_400),
  // Keep the pool size within a sane range -- at least 1 (so a mistake can't lock everyone out
  // entirely) and capped at 20 (so the header/UI doesn't break under a huge count).
  heartsMax: z.number().int().min(1).max(20),
});

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getDataStore().getSettings();
    return NextResponse.json({
      heartRefillIntervalSeconds: Math.round(settings.heartRefillIntervalMs / 1000),
      heartsMax: settings.heartsMax ?? HEARTS_MAX,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }

    const settings = {
      heartRefillIntervalMs: parsed.data.heartRefillIntervalSeconds * 1000,
      heartsMax: parsed.data.heartsMax,
    };
    await getDataStore().upsertSettings(settings);
    return NextResponse.json({
      heartRefillIntervalSeconds: parsed.data.heartRefillIntervalSeconds,
      heartsMax: parsed.data.heartsMax,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
