import "server-only";
import type { AuthProvider, AuthUser } from "./types";
import { getAdminAuth } from "@/lib/firebaseAdmin";

/**
 * Server-side half of the Firebase auth provider. Only verifyToken() is
 * usable here -- the other three methods are client-only (see
 * firebaseAuthProviderClient.ts, used via getClientAuthProvider()).
 */
function clientOnly(): never {
  throw new Error("This is a client-only AuthProvider method; call it via getClientAuthProvider().");
}

export const firebaseAuthProvider: AuthProvider = {
  async signInWithGoogle() {
    clientOnly();
  },
  async signInAsDemoUser() {
    clientOnly();
  },
  async signOut() {
    clientOnly();
  },

  async verifyToken(idToken: string): Promise<AuthUser> {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      displayName: decoded.name ?? decoded.email ?? "Learner",
      email: decoded.email ?? null,
      photoURL: decoded.picture ?? null,
      provider: "google",
    };
  },
};
