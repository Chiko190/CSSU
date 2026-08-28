import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthProvider } from "@/core/auth/provider";
import { createSessionToken } from "@/core/auth/session";
import { getDataStore } from "@/core/data/store";
import { SESSION_COOKIE_NAME } from "@/lib/env";

export const runtime = "nodejs";

const bodySchema = z.object({ idToken: z.string().min(1) });

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const provider = getAuthProvider();
  let authUser;
  try {
    authUser = await provider.verifyToken(parsed.data.idToken);
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const store = getDataStore();
  const existing = await store.getUser(authUser.uid);
  await store.upsertUser({
    uid: authUser.uid,
    displayName: authUser.displayName,
    email: authUser.email,
    photoURL: authUser.photoURL,
    createdAt: existing?.createdAt ?? Date.now(),
  });

  const token = createSessionToken(authUser.uid);
  const response = NextResponse.json({ user: authUser });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
