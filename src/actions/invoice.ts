"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const invoiceSchema = z.object({
  requestId: z.string().min(1),
  vatRate: z.coerce.number().min(0).max(100).default(0),
  paymentTerms: z.string().min(1),
  invoiceNumber: z.string().optional(),
});

export async function generateInvoice(
  _prev: ActionResult<{ invoiceNumber: string }>,
  formData: FormData
): Promise<ActionResult<{ invoiceNumber: string }>> {
  const { userId } = await requireAuth();

  const parsed = invoiceSchema.safeParse({
    requestId: formData.get("requestId"),
    vatRate: formData.get("vatRate"),
    paymentTerms: formData.get("paymentTerms"),
    invoiceNumber: formData.get("invoiceNumber"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { requestId, vatRate, paymentTerms } = parsed.data;

  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: { profile: { select: { userId: true, id: true, invoiceCounter: true } } },
    });

    if (!request || request.profile.userId !== userId) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "accepted" && request.status !== "done") {
      return { success: false, error: "Can only generate invoices for accepted/done bookings" };
    }

    // Generate invoice number if not already set
    let invoiceNumber = parsed.data.invoiceNumber;
    if (!invoiceNumber || !request.invoiceNumber) {
      const year = new Date().getFullYear();
      const newCounter = request.profile.invoiceCounter + 1;

      await prisma.crewProfile.update({
        where: { id: request.profile.id },
        data: { invoiceCounter: newCounter },
      });

      invoiceNumber = `INV-${year}-${String(newCounter).padStart(5, "0")}`;
    }

    await prisma.bookingRequest.update({
      where: { id: requestId },
      data: {
        invoiceNumber: parseInt(invoiceNumber.replace(/\D/g, "").slice(-5), 10) || 1,
        invoiceIssuedAt: new Date(),
        vatRate: Math.round(vatRate),
      },
    });

    logger.info({ userId, requestId, invoiceNumber, vatRate, paymentTerms }, "invoice:generated");
    revalidatePath(`/dashboard/invoice/${requestId}`);
    return { success: true, data: { invoiceNumber } };
  } catch (err) {
    logger.error({ err }, "invoice:generate_error");
    return { success: false, error: "Failed to generate invoice" };
  }
}
