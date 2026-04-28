"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const addClipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  url: z.string().url("Valid URL is required"),
});

const updateClipSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  url: z.string().url("Valid URL is required"),
});

// ─── Plan limits ───────────────────────────────────────────

const CLIP_LIMITS: Record<string, number> = { free: 3, pro: 5 };

// ─── Add Clip ──────────────────────────────────────────────

export async function addClip(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
  };

  const parsed = addClipSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const profile = await prisma.crewProfile.findUnique({
      where: { userId },
      select: { id: true, plan: true },
    });
    if (!profile) return { success: false, error: "Profile not found" };

    const clipCount = await prisma.videoClip.count({
      where: { profileId: profile.id },
    });

    const limit = CLIP_LIMITS[profile.plan] ?? 3;
    if (clipCount >= limit) {
      return {
        success: false,
        error: `You've reached the ${limit} clip limit. ${profile.plan === "free" ? "Upgrade to Pro for 5 clips." : ""}`,
      };
    }

    const isFeatured = clipCount === 0;

    await prisma.videoClip.create({
      data: {
        profileId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        url: parsed.data.url,
        sortOrder: clipCount,
        isFeatured,
      },
    });

    logger.info({ userId, title: parsed.data.title }, "clips:add");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "clips:add_error");
    return { success: false, error: "Failed to add clip" };
  }
}

// ─── Remove Clip ───────────────────────────────────────────

export async function removeClip(clipId: string): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const clip = await prisma.videoClip.findUnique({
      where: { id: clipId },
      include: { profile: { select: { userId: true } } },
    });

    if (!clip || clip.profile.userId !== userId) {
      return { success: false, error: "Clip not found" };
    }

    await prisma.videoClip.delete({ where: { id: clipId } });

    // If deleted clip was featured, make the first remaining clip featured
    if (clip.isFeatured) {
      const firstClip = await prisma.videoClip.findFirst({
        where: { profileId: clip.profileId },
        orderBy: { sortOrder: "asc" },
      });
      if (firstClip) {
        await prisma.videoClip.update({
          where: { id: firstClip.id },
          data: { isFeatured: true },
        });
      }
    }

    logger.info({ userId, clipId }, "clips:remove");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "clips:remove_error");
    return { success: false, error: "Failed to remove clip" };
  }
}

// ─── Update Clip ───────────────────────────────────────────

export async function updateClip(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
  };

  const parsed = updateClipSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const clip = await prisma.videoClip.findUnique({
      where: { id: parsed.data.id },
      include: { profile: { select: { userId: true } } },
    });

    if (!clip || clip.profile.userId !== userId) {
      return { success: false, error: "Clip not found" };
    }

    await prisma.videoClip.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        url: parsed.data.url,
      },
    });

    logger.info({ userId, clipId: parsed.data.id }, "clips:update");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "clips:update_error");
    return { success: false, error: "Failed to update clip" };
  }
}
// ─── Reorder Clips ─────────────────────────────────────────

export async function reorderClips(clipIds: string[]): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const profile = await prisma.crewProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) return { success: false, error: "Profile not found" };

    // Verify all clips belong to this profile
    const clips = await prisma.videoClip.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });

    const profileClipIds = new Set(clips.map((c) => c.id));
    const allBelong = clipIds.every((id) => profileClipIds.has(id));
    if (!allBelong) {
      return { success: false, error: "Invalid clip IDs" };
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      clipIds.map((id, index) =>
        prisma.videoClip.update({
          where: { id },
          data: {
            sortOrder: index,
            isFeatured: index === 0,
          },
        })
      )
    );

    logger.info({ userId, order: clipIds }, "clips:reordered");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "clips:reorder_error");
    return { success: false, error: "Failed to reorder clips" };
  }
}
