"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AVATAR_PRESETS, parseAvatarPreset, toAvatarPhotoURL } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/fetcher";

export function ProfileEditor({
  displayName,
  photoURL,
}: {
  displayName: string;
  photoURL: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(displayName);
  const [avatarId, setAvatarId] = useState(parseAvatarPreset(photoURL)?.id ?? AVATAR_PRESETS[0].id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ displayName: name.trim(), avatarId }),
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <label htmlFor="nickname" className="block text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated border border-border text-text text-sm focus:outline-none focus:border-primary/60"
          placeholder="Your nickname"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">Avatar</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setAvatarId(preset.id)}
              aria-label={`Choose the ${preset.id} avatar`}
              aria-pressed={avatarId === preset.id}
              className={`rounded-[var(--radius-md)] p-1 border-2 transition-colors ${
                avatarId === preset.id ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <Avatar
                photoURL={toAvatarPhotoURL(preset.id)}
                displayName={name}
                className="h-10 w-10 text-xl mx-auto"
              />
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || name.trim().length === 0}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setName(displayName);
            setAvatarId(parseAvatarPreset(photoURL)?.id ?? AVATAR_PRESETS[0].id);
            setError(null);
          }}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}
