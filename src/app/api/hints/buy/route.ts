import { NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { buyHint } from "@/core/progress/hints";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await requireServerSession();
    const result = await buyHint(user.uid);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ balance: result.balance, totalXp: result.totalXp });
  } catch (err) {
    return errorResponse(err);
  }
}
