import type { AuthProvider, AuthUser } from "./types";

const DEVICE_ID_KEY = "css-nc2:mock-device-id";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("mockAuthProvider.signInAsDemoUser can only run in the browser");
  }
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

/**
 * Dev/demo auth provider. Issues a self-describing "idToken" (no external
 * service involved) that verifyToken() below can parse back into an
 * AuthUser. This keeps the sign-in -> exchange-token-for-session flow
 * identical in shape to the real Google flow, so swapping in
 * firebaseAuthProvider later doesn't change any calling code.
 */
export const mockAuthProvider: AuthProvider = {
  async signInWithGoogle() {
    throw new Error(
      "Google Sign-In isn't available in mock mode. Set NEXT_PUBLIC_PROVIDER=firebase and fill in the Firebase env vars to enable it."
    );
  },

  async signInAsDemoUser(displayName = "Demo Learner") {
    const deviceId = getOrCreateDeviceId();
    const idToken = `mock:${deviceId}:${encodeURIComponent(displayName)}`;
    return { idToken };
  },

  async signOut() {
    // Session state lives in an httpOnly cookie; cleared via POST /api/auth/signout.
  },

  async verifyToken(idToken: string): Promise<AuthUser> {
    const [scheme, deviceId, encodedName] = idToken.split(":");
    if (scheme !== "mock" || !deviceId) {
      throw new Error("Invalid mock token");
    }
    const displayName = encodedName ? decodeURIComponent(encodedName) : "Demo Learner";
    return {
      uid: `mock-${deviceId}`,
      displayName,
      email: null,
      photoURL: null,
      provider: "mock",
    };
  },
};
