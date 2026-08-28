/**
 * ByteForge's mark: an IC chip silhouette (the "Byte") with a forge-spark
 * bolt at its center (the "Forge"). Pure inline SVG so it scales cleanly
 * from the header down to the browser tab (see src/app/icon.svg, which
 * mirrors this shape).
 */
export function Logomark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="var(--primary)" strokeWidth="1.6" />
      {[8, 12, 16].map((x) => (
        <g key={x}>
          <line x1={x} y1="1.5" x2={x} y2="5" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1={x} y1="19" x2={x} y2="22.5" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M13.4 8L9.8 13.2H12.3L10.9 16.6L15.1 11H12.5L13.4 8Z" fill="var(--accent)" />
    </svg>
  );
}
