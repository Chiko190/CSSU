export interface AuthUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  provider: "mock" | "google";
}

export interface Session {
  uid: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthProvider {
  /** Client-callable: initiates Google sign-in, resolves with a token to exchange server-side. */
  signInWithGoogle(): Promise<{ idToken: string }>;
  /** Client-callable: mock-only convenience sign-in; the Firebase provider rejects this. */
  signInAsDemoUser(displayName?: string): Promise<{ idToken: string }>;
  /** Client-callable: clears any client-side auth state (the session cookie is cleared server-side). */
  signOut(): Promise<void>;
  /** Server-callable: verifies an idToken and returns the canonical user it belongs to. */
  verifyToken(idToken: string): Promise<AuthUser>;
}
