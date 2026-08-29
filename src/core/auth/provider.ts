import "server-only";
import { PROVIDER } from "@/lib/env";
import type { AuthProvider } from "./types";
import { mockAuthProvider } from "./mockAuthProvider";
import { firebaseAuthProvider } from "./firebaseAuthProvider";

/** Server-only: verifyToken() needs firebase-admin. Client components must use getClientAuthProvider(). */
export function getAuthProvider(): AuthProvider {
  return PROVIDER === "firebase" ? firebaseAuthProvider : mockAuthProvider;
}
