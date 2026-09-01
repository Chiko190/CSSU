export interface AuthUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  provider: "mock" | "google" | "password";
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
  /** Client-callable: creates a new email/password account and signs into it; the mock provider
   * rejects this (email/password auth only exists against real Firebase). */
  registerWithEmail(email: string, password: string, displayName: string): Promise<{ idToken: string }>;
  /** Client-callable: signs into an existing email/password account. */
  signInWithEmail(email: string, password: string): Promise<{ idToken: string }>;
  /** Client-callable: sends Firebase's built-in "reset your password" email. */
  sendPasswordReset(email: string): Promise<void>;
  /** Client-callable: clears any client-side auth state (the session cookie is cleared server-side). */
  signOut(): Promise<void>;
  /** Server-callable: verifies an idToken and returns the canonical user it belongs to. */
  verifyToken(idToken: string): Promise<AuthUser>;
}
