export type ProviderKind = "mock" | "firebase";

export const PROVIDER: ProviderKind =
  process.env.NEXT_PUBLIC_PROVIDER === "firebase" ? "firebase" : "mock";

export const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

export const SESSION_COOKIE_NAME = "css_nc2_session";
