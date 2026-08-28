import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/core/auth/getServerSession";
import { getModuleStatus } from "@/core/progress/unlock";
import { getDataStore } from "@/core/data/store";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;
    const user = await requireServerSession();
    const status = await getModuleStatus(user.uid, moduleId);
    const store = getDataStore();
    const progress = await store.getModuleProgress(user.uid, moduleId);
    return NextResponse.json({ ...status, progress });
  } catch (err) {
    return errorResponse(err);
  }
}
