"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateConfirmationId } from "@/lib/confirmation-id";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

// ─── Accept Request ────────────────────────────────────────

export async function acceptRequest(requestId: string): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: { profile: { select: { userId: true, id: true } } },
    });

    if (!request || request.profile.userId !== userId) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, error: "Request is no longer pending" };
    }

    const confirmationId = await generateConfirmationId();

    // Transaction: create booking + update request status
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          profileId: request.profileId,
          title: request.projectName,
          client: request.producerCompany,
          startDate: request.startDate,
          endDate: request.endDate,
          dayRate: request.offeredRate,
          status: "confirmed",
        },
      });

      await tx.bookingRequest.update({
        where: { id: requestId },
        data: {
          status: "accepted",
          confirmationId,
          acceptedAt: new Date(),
          bookingId: booking.id,
        },
      });
    });

    logger.info({ userId, requestId, confirmationId }, "booking:accepted");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/request/${requestId}`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "booking:accept_error");
    return { success: false, error: "Failed to accept request" };
  }
}

// ─── Decline Request ───────────────────────────────────────

export async function declineRequest(requestId: string): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: { profile: { select: { userId: true } } },
    });

    if (!request || request.profile.userId !== userId) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, error: "Request is no longer pending" };
    }

    await prisma.bookingRequest.update({
      where: { id: requestId },
      data: {
        status: "declined",
        declinedAt: new Date(),
      },
    });

    logger.info({ userId, requestId }, "booking:declined");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/request/${requestId}`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "booking:decline_error");
    return { success: false, error: "Failed to decline request" };
  }
}
