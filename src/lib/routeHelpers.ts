import { NextResponse } from "next/server";
import { UnauthenticatedError } from "@/core/auth/getServerSession";
import { ModuleLockedError, UnknownModuleError } from "@/core/progress/unlock";

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (err instanceof ModuleLockedError) {
    return NextResponse.json({ error: "This module is locked" }, { status: 403 });
  }
  if (err instanceof UnknownModuleError) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
