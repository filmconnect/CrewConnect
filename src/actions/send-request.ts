"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const sendRequestSchema = z.object({
  profileId: z.string().min(1),
  slug: z.string().min(1),
  producerName: z.string().min(2, "Your name is required"),
  producerCompany: z.string().optional().default(""),
  producerEmail: z.string().email("Valid email is required"),
  producerVat: z.string().optional().default(""),
  projectName: z.string().min(1, "Project name is required"),
  role: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  offeredRate: z.coerce.number().min(1, "Day rate must be at least €1"),
  message: z.string().optional().default(""),
});

export async function sendRequest(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = sendRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  // Validate dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate < startDate) {
    return { success: false, error: "End date must be after start date" };
  }

  if (startDate < new Date()) {
    return { success: false, error: "Start date must be in the future" };
  }

  try {
    // Verify profile exists
    const profile = await prisma.crewProfile.findUnique({
      where: { id: data.profileId },
      select: { id: true, slug: true, role: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Convert rate to cents
    const offeredRateCents = Math.round(data.offeredRate * 100);

    // Handle optional PDF attachment via Vercel Blob
    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    let attachmentSize: number | null = null;

    const file = formData.get("attachment") as File | null;
    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return { success: false, error: "Only PDF files are accepted" };
      }
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: "File must be smaller than 10MB" };
      }

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = await import("@vercel/blob");
        const blob = await put(`attachments/${Date.now()}-${file.name}`, file, {
          access: "public",
          addRandomSuffix: true,
        });
        attachmentUrl = blob.url;
      } else {
        // Dev fallback: skip upload, log warning
        logger.warn("booking:attachment_skipped — set BLOB_READ_WRITE_TOKEN");
      }

      attachmentName = file.name;
      attachmentSize = file.size;
    }

    const request = await prisma.bookingRequest.create({
      data: {
        profileId: data.profileId,
        producerName: data.producerName,
        producerCompany: data.producerCompany || null,
        producerEmail: data.producerEmail,
        producerVat: data.producerVat || null,
        projectName: data.projectName,
        role: data.role || profile.role,
        startDate,
        endDate,
        offeredRate: offeredRateCents,
        message: data.message || null,
        attachmentUrl,
        attachmentName,
        attachmentSize,
        status: "pending",
      },
    });

    logger.info(
      { requestId: request.id, profileId: data.profileId, project: data.projectName },
      "booking:request_sent"
    );
  } catch (err) {
    logger.error({ err }, "booking:send_request_error");
    return { success: false, error: "Failed to send request. Please try again." };
  }

  redirect(`/book/${data.slug}/sent`);
}
