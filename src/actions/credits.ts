"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const addCreditSchema = z.object({
  year: z.coerce.number().min(1970).max(2100, "Invalid year"),
  projectName: z.string().min(1, "Project name is required"),
  format: z.string().min(1, "Format is required"),
  role: z.string().min(1, "Role is required"),
  director: z.string().optional().default(""),
  agency: z.string().optional().default(""),
});

const CREDIT_LIMITS: Record<string, number> = { free: 10, pro: 999999 };

// ─── Add Credit ────────────────────────────────────────────

export async function addCredit(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    year: formData.get("year"),
    projectName: formData.get("projectName"),
    format: formData.get("format"),
    role: formData.get("role"),
    director: formData.get("director"),
    agency: formData.get("agency"),
  };

  const parsed = addCreditSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const profile = await prisma.crewProfile.findUnique({
      where: { userId },
      select: { id: true, plan: true },
    });
    if (!profile) return { success: false, error: "Profile not found" };

    const creditCount = await prisma.credit.count({
      where: { profileId: profile.id },
    });

    const limit = CREDIT_LIMITS[profile.plan] ?? 10;
    if (creditCount >= limit) {
      return {
        success: false,
        error: `You've reached the ${limit} credit limit. Upgrade to Pro for unlimited credits.`,
      };
    }

    await prisma.credit.create({
      data: {
        profileId: profile.id,
        year: parsed.data.year,
        projectName: parsed.data.projectName,
        format: parsed.data.format,
        role: parsed.data.role,
        director: parsed.data.director || null,
        agency: parsed.data.agency || null,
        status: "self",
      },
    });

    logger.info({ userId, projectName: parsed.data.projectName }, "credits:add");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "credits:add_error");
    return { success: false, error: "Failed to add credit" };
  }
}

// ─── Remove Credit ─────────────────────────────────────────

export async function removeCredit(creditId: string): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const credit = await prisma.credit.findUnique({
      where: { id: creditId },
      include: { profile: { select: { userId: true } } },
    });

    if (!credit || credit.profile.userId !== userId) {
      return { success: false, error: "Credit not found" };
    }

    await prisma.credit.delete({ where: { id: creditId } });

    logger.info({ userId, creditId }, "credits:remove");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "credits:remove_error");
    return { success: false, error: "Failed to remove credit" };
  }
}
