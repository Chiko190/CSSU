import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/env";
import { verifySessionToken } from "./session";
import { getDataStore } from "@/core/data/store";
import type { AuthUser } from "./types";

export async function getServerSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;

  const store = getDataStore();
  const profile = await store.getUser(session.uid);
  if (!profile) return null;

  return {
    uid: profile.uid,
    displayName: profile.displayName,
    email: profile.email,
    photoURL: profile.photoURL,
    provider: profile.uid.startsWith("mock-") ? "mock" : "google",
  };
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("UNAUTHENTICATED");
    this.name = "UnauthenticatedError";
  }
}

export async function requireServerSession(): Promise<AuthUser> {
  const user = await getServerSession();
  if (!user) throw new UnauthenticatedError();
  return user;
}
