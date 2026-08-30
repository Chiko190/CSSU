import { parseAvatarPreset } from "@/lib/avatars";

const COLOR_BG: Record<string, string> = {
  primary: "bg-primary/20 text-primary",
  accent: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
  xp: "bg-xp/20 text-xp",
  warning: "bg-warning/20 text-warning",
};

/** Renders a user's avatar: a real photo URL (Google sign-in), one of the in-app emoji
 * presets (`avatar:<id>`, set via the profile editor), or initials as a last resort. */
export function Avatar({
  photoURL,
  displayName,
  className = "",
}: {
  photoURL: string | null;
  displayName: string;
  className?: string;
}) {
  const preset = parseAvatarPreset(photoURL);

  if (preset) {
    return (
      <div
        className={`rounded-full border border-border flex items-center justify-center overflow-hidden shrink-0 ${COLOR_BG[preset.colorVar]} ${className}`}
        aria-hidden
      >
        <span className="leading-none">{preset.emoji}</span>
      </div>
    );
  }

  if (photoURL) {
    return (
      <div className={`rounded-full bg-surface-2 border border-border overflow-hidden shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- external Google profile photo */}
        <img src={photoURL} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-surface-2 border border-border flex items-center justify-center font-semibold text-text shrink-0 ${className}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}
