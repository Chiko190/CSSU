"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AVATAR_PRESETS, parseAvatarPreset, toAvatarPhotoURL } from "@/lib/avatars";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/fetcher";

const UPLOAD_SIZE_PX = 160;

/** Reads an image file, cover-crops it to a square, and re-encodes it as a compressed JPEG data
 * URI -- small enough to store inline on the user profile (no Storage bucket is configured in
 * this project) and consistent with how a preset avatar's photoURL string already works. */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = UPLOAD_SIZE_PX;
  canvas.height = UPLOAD_SIZE_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that image");

  const scale = Math.max(UPLOAD_SIZE_PX / bitmap.width, UPLOAD_SIZE_PX / bitmap.height);
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  ctx.drawImage(bitmap, (UPLOAD_SIZE_PX - drawWidth) / 2, (UPLOAD_SIZE_PX - drawHeight) / 2, drawWidth, drawHeight);

  return canvas.toDataURL("image/jpeg", 0.82);
}

export function ProfileEditor({
  displayName,
  photoURL,
}: {
  displayName: string;
  photoURL: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(displayName);
  // null means "leave the current photo alone" -- it only becomes non-null once the learner
  // actively picks a preset or uploads a new photo. Defaulting this to the first preset would
  // silently swap away a real photo (Google's, or a previous upload) the moment this opens.
  const [avatarId, setAvatarId] = useState<string | null>(parseAvatarPreset(photoURL)?.id ?? null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
    );
  }

  const previewPhotoURL = photoDataUrl ?? (avatarId ? toAvatarPhotoURL(avatarId) : photoURL);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setPhotoDataUrl(dataUrl);
      setAvatarId(null);
    } catch {
      setError("Couldn't process that image -- try a different photo.");
    } finally {
      e.target.value = "";
    }
  }

  function choosePreset(id: string) {
    setAvatarId(id);
    setPhotoDataUrl(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: name.trim(),
          ...(photoDataUrl ? { photoDataUrl } : avatarId ? { avatarId } : {}),
        }),
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
        <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">Photo</p>
        <div className="flex items-center gap-3">
          <Avatar photoURL={previewPhotoURL} displayName={name} className="h-14 w-14 text-2xl" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="secondary" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
            Upload photo
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-faint mb-1.5">Or pick an avatar</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {AVATAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => choosePreset(preset.id)}
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
            setAvatarId(parseAvatarPreset(photoURL)?.id ?? null);
            setPhotoDataUrl(null);
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
