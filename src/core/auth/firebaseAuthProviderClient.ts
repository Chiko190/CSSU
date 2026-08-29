import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import type { AuthProvider, AuthUser } from "./types";
import { getFirebaseAuth } from "@/lib/firebaseClient";

/**
 * Browser-side half of the Firebase auth provider. Deliberately has no
 * dependency on firebase-admin (Node-only) so it's safe to bundle into
 * client components -- see firebaseAuthProvider.ts for the server half.
 */
function serverOnly(): never {
  throw new Error("This is a server-only AuthProvider method; call it via getAuthProvider().");
}

export const firebaseAuthProviderClient: AuthProvider = {
  async signInWithGoogle() {
    const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    const idToken = await result.user.getIdToken();
    return { idToken };
  },

  async signInAsDemoUser(): Promise<{ idToken: string }> {
    throw new Error("Demo sign-in is only available with NEXT_PUBLIC_PROVIDER=mock.");
  },

  async signOut() {
    await firebaseSignOut(getFirebaseAuth());
  },

  async verifyToken(): Promise<AuthUser> {
    serverOnly();
  },
};
