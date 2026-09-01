import { requireServerSession } from "./getServerSession";
import type { AuthUser } from "./types";

/** Comma-separated allowlist of admin emails. No in-app role/UI to grant admin -- it's set via
 * this env var in whichever deployment needs it. */
function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase());
}

export class ForbiddenError extends Error {
  constructor(message = "Admin access required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws ForbiddenError (mapped to 403 by routeHelpers.errorResponse) unless the signed-in
 * user's email is in ADMIN_EMAILS. Also throws UnauthenticatedError if not signed in at all. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireServerSession();
  if (!isAdminEmail(user.email)) {
    throw new ForbiddenError();
  }
  return user;
}
