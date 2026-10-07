import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_SECRET } from "@/lib/env";
import type { Session } from "./types";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";

/** The HMAC key. In production a missing SESSION_SECRET used to fall back silently to the public
 * dev string above -- anyone reading the source could then forge a session cookie for any uid.
 * Fail closed instead: refuse to sign or verify until a real secret is configured. Checked here
 * (server-only) rather than in lib/env, which client pages also import. */
function secret(): string {
  if (process.env.NODE_ENV === "production" && (!SESSION_SECRET || SESSION_SECRET === DEV_FALLBACK_SECRET)) {
    throw new Error("SESSION_SECRET is not set -- refusing to sign sessions with the insecure dev fallback in production.");
  }
  return SESSION_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(uid: string): string {
  const session: Session = {
    uid,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = sign(payload);
  } catch {
    return null; // misconfigured secret -- treat as signed out rather than crash every page
  }
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (typeof session.uid !== "string" || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
