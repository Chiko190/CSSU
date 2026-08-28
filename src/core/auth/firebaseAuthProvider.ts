import type { AuthProvider, AuthUser } from "./types";

/**
 * Stub satisfying AuthProvider so the app compiles and type-checks with
 * NEXT_PUBLIC_PROVIDER=firebase before real credentials exist.
 *
 * To activate real Google Sign-In:
 *  1. `npm install firebase firebase-admin`
 *  2. Fill in NEXT_PUBLIC_FIREBASE_* and FIREBASE_SERVICE_ACCOUNT_JSON in .env.local
 *  3. Replace the bodies below with the Firebase Web SDK (client methods) and
 *     firebase-admin's auth().verifyIdToken() (verifyToken), keeping the same
 *     AuthProvider signatures so no calling code changes.
 */
function unconfigured(): never {
  throw new Error(
    "Firebase auth provider is not configured yet. Add NEXT_PUBLIC_FIREBASE_* and " +
      "FIREBASE_SERVICE_ACCOUNT_JSON to your environment, implement src/core/auth/firebaseAuthProvider.ts, " +
      "then set NEXT_PUBLIC_PROVIDER=firebase."
  );
}

export const firebaseAuthProvider: AuthProvider = {
  async signInWithGoogle(): Promise<{ idToken: string }> {
    unconfigured();
  },
  async signInAsDemoUser(): Promise<{ idToken: string }> {
    throw new Error("Demo sign-in is only available with NEXT_PUBLIC_PROVIDER=mock.");
  },
  async signOut(): Promise<void> {
    unconfigured();
  },
  async verifyToken(): Promise<AuthUser> {
    unconfigured();
  },
};
