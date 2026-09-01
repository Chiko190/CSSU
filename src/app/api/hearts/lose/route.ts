import { NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { loseHeart } from "@/core/progress/hearts";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

/** Generic "lose a heart" action for mistakes made outside the quiz flow -- e.g. pressing the
 * wrong part in the 3D disassembly/assembly scene. Doesn't touch any quiz attempt state; that's
 * handled separately by /api/quiz/[moduleId]/[taskId]/answer for wrong quiz answers. Safe to call
 * at 0 hearts already -- loseHeart() just reports ok: false without going negative. */
export async function POST() {
  try {
    const user = await requireServerSession();
    const result = await loseHeart(user.uid);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
