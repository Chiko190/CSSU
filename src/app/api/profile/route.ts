import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { AVATAR_PRESETS, toAvatarPhotoURL } from "@/lib/avatars";
import { errorResponse } from "@/lib/routeHelpers";

export const runtime = "nodejs";

const AVATAR_IDS = AVATAR_PRESETS.map((p) => p.id) as [string, ...string[]];

// Uploaded photos are stored inline as a data URI (no Storage bucket is configured in this
// project) -- capped well under Firestore's 1MiB doc limit and generous for a compressed
// ~160x160 avatar.
const MAX_PHOTO_DATA_URL_LENGTH = 400_000;
const photoDataUrlSchema = z
  .string()
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/, "Invalid photo data")
  .max(MAX_PHOTO_DATA_URL_LENGTH, "Photo is too large");

const bodySchema = z.object({
  displayName: z.string().trim().min(1, "Nickname can't be empty").max(24, "Nickname is too long"),
  avatarId: z.enum(AVATAR_IDS).optional(),
  photoDataUrl: photoDataUrlSchema.optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireServerSession();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }
    if (!parsed.data.avatarId && !parsed.data.photoDataUrl) {
      return NextResponse.json({ error: "Choose a preset avatar or upload a photo" }, { status: 400 });
    }

    const store = getDataStore();
    const existing = await store.getUser(user.uid);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = {
      ...existing,
      displayName: parsed.data.displayName,
      photoURL: parsed.data.photoDataUrl ?? toAvatarPhotoURL(parsed.data.avatarId!),
    };
    await store.upsertUser(updated);

    return NextResponse.json({ displayName: updated.displayName, photoURL: updated.photoURL });
  } catch (err) {
    return errorResponse(err);
  }
}
