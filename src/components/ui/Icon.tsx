import type { SVGProps } from "react";

/** A small set of line icons in one consistent style, replacing emoji
 * (🔒 ✅ 🎉 etc.) so status/feedback states read as designed, not default. */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconLock({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconUnlock({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.5-1.9" />
    </svg>
  );
}

export function IconCheckCircle({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.4 2.4 4.8-5.2" />
    </svg>
  );
}

export function IconXCircle({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4" />
    </svg>
  );
}

export function IconAlertTriangle({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M12 4.5L21 19.5H3L12 4.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkle({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" className={className} aria-hidden {...props}>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="M19 15.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" opacity="0.7" />
    </svg>
  );
}

export function IconBook({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
    </svg>
  );
}

export function IconWrench({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L4 16.7 7.3 20l5.3-5.3a4 4 0 0 0 5.1-5.4l-2.9 2.9-2.1-2.1 2.9-2.9Z" />
    </svg>
  );
}

export function IconBolt({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" className={className} aria-hidden {...props}>
      <path d="M13 2 4.5 13.5H11L10 22l9-12h-6.5L13 2Z" />
    </svg>
  );
}

export function IconChevronRight({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M9 5.5 15 12 9 18.5" />
    </svg>
  );
}

export function IconDownload({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M12 3.5v11" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 17v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function IconTrophy({ className = "h-9 w-9", ...props }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a3 3 0 0 0 3 3.5M17 5h3a3 3 0 0 1-3 3.5" />
      <path d="M12 14v3" />
      <path d="M8.5 20.5h7M9.5 17.5l-1 3M14.5 17.5l1 3" />
    </svg>
  );
}
