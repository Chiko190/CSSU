import { NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { getHearts } from "@/core/progress/hearts";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireServerSession();
    const hearts = await getHearts(user.uid);
    return NextResponse.json(hearts);
  } catch (err) {
    return errorResponse(err);
  }
}
