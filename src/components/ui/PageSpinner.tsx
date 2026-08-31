/** Full-bleed loading state for a route segment's `loading.tsx` boundary -- same spinner
 * language as the 3D scene's own LoadingIndicator, so a page-level wait and an asset-level wait
 * read as the same app, not two different loaders bolted together. */
export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24" role="status" aria-live="polite">
      <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <span className="text-sm font-medium text-text-muted">{label}</span>
    </div>
  );
}
