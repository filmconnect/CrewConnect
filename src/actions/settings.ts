"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const updateAccountSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  legalName: z.string().optional().default(""),
  address: z.string().optional().default(""),
  vatNumber: z.string().optional().default(""),
  iban: z.string().optional().default(""),
  paymentTerms: z.enum(["Net 7", "Net 14", "Net 30", "Net 60"]),
});

export async function updateAccount(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const parsed = updateAccountSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const data: { email: string; passwordHash?: string } = {
      email: parsed.data.email,
    };

    if (parsed.data.password && parsed.data.password.length >= 8) {
      data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    }

    await prisma.user.update({ where: { id: userId }, data });

    logger.info({ userId }, "settings:account_updated");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "settings:account_update_error");
    return { success: false, error: "Failed to update account" };
  }
}

export async function updateInvoiceDetails(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const parsed = updateInvoiceSchema.safeParse({
    legalName: formData.get("legalName"),
    address: formData.get("address"),
    vatNumber: formData.get("vatNumber"),
    iban: formData.get("iban"),
    paymentTerms: formData.get("paymentTerms"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await prisma.crewProfile.update({
      where: { userId },
      data: {
        legalName: parsed.data.legalName || null,
        address: parsed.data.address || null,
        vatNumber: parsed.data.vatNumber || null,
        iban: parsed.data.iban || null,
        paymentTerms: parsed.data.paymentTerms,
      },
    });

    logger.info({ userId }, "settings:invoice_updated");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "settings:invoice_update_error");
    return { success: false, error: "Failed to update invoice details" };
  }
}

// ─── Delete Account ────────────────────────────────────────

export async function deleteAccount(): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    // Prisma cascade will handle: crewProfile → clips, credits, bookings, blockedDates, bookingRequests → messages
    // Also: sessions, passwordResets
    await prisma.user.delete({ where: { id: userId } });

    logger.info({ userId }, "settings:account_deleted");

    // Clear session cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("cc_session");

    return { success: true };
  } catch (err) {
    logger.error({ err, userId }, "settings:account_delete_error");
    return { success: false, error: "Failed to delete account" };
  }
}
