"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatar(formData: FormData): Promise<ActionResult<string>> {
  const { userId } = await requireAuth();

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No file selected" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG and WebP images are allowed" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File must be smaller than 2MB" };
  }

  try {
    // Dynamic import to avoid build error when BLOB_READ_WRITE_TOKEN isn't set
    let avatarUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`avatars/${userId}-${Date.now()}.${file.type.split("/")[1]}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      avatarUrl = blob.url;
    } else {
      // Dev fallback: store as data URL (not for production)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      logger.warn("avatar:using_data_url_fallback — set BLOB_READ_WRITE_TOKEN for production");
    }

    await prisma.crewProfile.update({
      where: { userId },
      data: { avatarUrl },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    logger.info({ userId }, "avatar:uploaded");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    return { success: true, data: avatarUrl };
  } catch (err) {
    logger.error({ err }, "avatar:upload_error");
    return { success: false, error: "Failed to upload avatar" };
  }
}
