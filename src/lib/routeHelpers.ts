import { NextResponse } from "next/server";
import { UnauthenticatedError } from "@/core/auth/getServerSession";
import { ForbiddenError } from "@/core/auth/admin";
import { ModuleLockedError, UnknownModuleError } from "@/core/progress/unlock";
import { NoHeartsError } from "@/core/progress/quizAttempt";

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof ModuleLockedError) {
    return NextResponse.json({ error: "This module is locked" }, { status: 403 });
  }
  if (err instanceof UnknownModuleError) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }
  if (err instanceof NoHeartsError) {
    return NextResponse.json({ error: err.message, nextRefillAt: err.nextRefillAt }, { status: 403 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
