import { PROVIDER } from "@/lib/env";
import type { AuthProvider } from "./types";
import { mockAuthProvider } from "./mockAuthProvider";
import { firebaseAuthProvider } from "./firebaseAuthProvider";

export function getAuthProvider(): AuthProvider {
  return PROVIDER === "firebase" ? firebaseAuthProvider : mockAuthProvider;
}
