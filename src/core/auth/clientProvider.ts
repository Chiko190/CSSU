import { PROVIDER } from "@/lib/env";
import type { AuthProvider } from "./types";
import { mockAuthProvider } from "./mockAuthProvider";
import { firebaseAuthProviderClient } from "./firebaseAuthProviderClient";

export function getClientAuthProvider(): AuthProvider {
  return PROVIDER === "firebase" ? firebaseAuthProviderClient : mockAuthProvider;
}
