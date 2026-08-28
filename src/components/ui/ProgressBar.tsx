export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`relative h-2.5 w-full rounded-[var(--radius-full)] bg-surface-2 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="relative h-full rounded-[var(--radius-full)] bg-primary shadow-[var(--shadow-glow-primary)] transition-[width] duration-500 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        {/* A fine diagonal hazard-stripe texture instead of a flat gradient fill --
            a small, deliberate nod to "technician's tape" rather than a generic bar. */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #04141c 0 3px, transparent 3px 9px)",
          }}
        />
      </div>
    </div>
  );
}
