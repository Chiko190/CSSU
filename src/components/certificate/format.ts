/** Shared by the client certificate canvas and server pages (the verify page), so it lives outside
 * the "use client" Certificate module. */
export function formatIssuedDate(issuedAt: number): string {
  return new Date(issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
