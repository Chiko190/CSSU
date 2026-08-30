/** Preset in-app avatars. A profile's `photoURL` is either a real image URL (from
 * Google sign-in) or one of these presets encoded as `"avatar:<id>"` -- there's no
 * file upload, so this is the only way a learner can customize their avatar. */
export interface AvatarPreset {
  id: string;
  emoji: string;
  /** One of the app's theme color tokens, used as the circle's background. */
  colorVar: "primary" | "accent" | "success" | "danger" | "xp" | "warning";
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "technician", emoji: "🧑‍💻", colorVar: "primary" },
  { id: "desktop", emoji: "🖥️", colorVar: "accent" },
  { id: "toolbox", emoji: "🛠️", colorVar: "success" },
  { id: "network", emoji: "🌐", colorVar: "warning" },
  { id: "server", emoji: "🗄️", colorVar: "danger" },
  { id: "circuit", emoji: "🔌", colorVar: "xp" },
  { id: "disk", emoji: "💾", colorVar: "primary" },
  { id: "satellite", emoji: "📡", colorVar: "accent" },
];

const AVATAR_PREFIX = "avatar:";

export function toAvatarPhotoURL(presetId: string): string {
  return `${AVATAR_PREFIX}${presetId}`;
}

export function parseAvatarPreset(photoURL: string | null): AvatarPreset | null {
  if (!photoURL || !photoURL.startsWith(AVATAR_PREFIX)) return null;
  const id = photoURL.slice(AVATAR_PREFIX.length);
  return AVATAR_PRESETS.find((p) => p.id === id) ?? null;
}

export function isAvatarPreset(photoURL: string | null): boolean {
  return Boolean(photoURL && photoURL.startsWith(AVATAR_PREFIX));
}
