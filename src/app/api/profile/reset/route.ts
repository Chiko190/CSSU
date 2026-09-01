import { NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

/** Wipes the signed-in user's module progress, quiz attempts, XP, and hearts -- leaves the
 * account itself (profile, email, photo) untouched. This is a progress reset, not a deletion. */
export async function POST() {
  try {
    const user = await requireServerSession();
    await getDataStore().resetUserProgress(user.uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
