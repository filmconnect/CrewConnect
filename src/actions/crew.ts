"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateBookingKey } from "@/lib/slug";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

// ─── Schemas ───────────────────────────────────────────────

const addBookingSchema = z.object({
  title: z.string().min(1, "Project name is required"),
  client: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  dayRate: z.coerce.number().min(0).optional(),
  notes: z.string().optional().default(""),
});

const editBookingSchema = z.object({
  bookingId: z.string().min(1),
  title: z.string().min(1, "Project name is required"),
  client: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  dayRate: z.coerce.number().min(0).optional(),
  notes: z.string().optional().default(""),
});

const blockDatesSchema = z.object({
  dates: z.string().min(1, "At least one date is required"),
  reason: z.string().optional().default(""),
});

// ─── Add Booking ───────────────────────────────────────────

export async function addBooking(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    title: formData.get("title"),
    client: formData.get("client"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    dayRate: formData.get("dayRate"),
    notes: formData.get("notes"),
  };

  const parsed = addBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { title, client, startDate, endDate, dayRate, notes } = parsed.data;

  try {
    const profile = await prisma.crewProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    // Convert dayRate from EUR to cents if provided
    const dayRateCents = dayRate ? Math.round(dayRate * 100) : null;

    await prisma.booking.create({
      data: {
        profileId: profile.id,
        title,
        client: client || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dayRate: dayRateCents,
        notes: notes || null,
        status: "confirmed",
      },
    });

    logger.info({ userId, title }, "crew:add_booking");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "crew:add_booking_error");
    return { success: false, error: "Failed to add booking" };
  }
}

// ─── Edit Booking ──────────────────────────────────────────

export async function editBooking(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    bookingId: formData.get("bookingId"),
    title: formData.get("title"),
    client: formData.get("client"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    dayRate: formData.get("dayRate"),
    notes: formData.get("notes"),
  };

  const parsed = editBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { bookingId, title, client, startDate, endDate, dayRate, notes } = parsed.data;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { profile: { select: { userId: true } } },
    });

    if (!booking || booking.profile.userId !== userId) {
      return { success: false, error: "Booking not found" };
    }

    const dayRateCents = dayRate ? Math.round(dayRate * 100) : null;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        title,
        client: client || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dayRate: dayRateCents,
        notes: notes || null,
      },
    });

    logger.info({ userId, bookingId, title }, "crew:edit_booking");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "crew:edit_booking_error");
    return { success: false, error: "Failed to update booking" };
  }
}

// ─── Block Dates ───────────────────────────────────────────

export async function blockDates(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    dates: formData.get("dates"),
    reason: formData.get("reason"),
  };

  const parsed = blockDatesSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const profile = await prisma.crewProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    const dateStrings = parsed.data.dates.split(",").filter(Boolean);
    const reason = parsed.data.reason || null;

    await prisma.blockedDate.createMany({
      data: dateStrings.map((d) => ({
        profileId: profile.id,
        date: new Date(d.trim()),
        reason,
      })),
      skipDuplicates: true,
    });

    logger.info({ userId, count: dateStrings.length }, "crew:block_dates");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "crew:block_dates_error");
    return { success: false, error: "Failed to block dates" };
  }
}

// ─── Delete Booking ────────────────────────────────────────

export async function deleteBooking(bookingId: string): Promise<ActionResult> {
  const { userId } = await requireAuth();

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { profile: { select: { userId: true } } },
    });

    if (!booking || booking.profile.userId !== userId) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.booking.delete({ where: { id: bookingId } });

    logger.info({ userId, bookingId }, "crew:delete_booking");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "crew:delete_booking_error");
    return { success: false, error: "Failed to delete booking" };
  }
}

// ─── Regenerate Booking Key ────────────────────────────────

export async function regenerateBookingKey(): Promise<ActionResult<string>> {
  const { userId } = await requireAuth();

  try {
    const newKey = generateBookingKey();

    await prisma.crewProfile.update({
      where: { userId },
      data: { bookingKey: newKey },
    });

    logger.info({ userId }, "crew:regenerate_booking_key");
    revalidatePath("/dashboard");
    return { success: true, data: newKey };
  } catch (err) {
    logger.error({ err }, "crew:regenerate_booking_key_error");
    return { success: false, error: "Failed to regenerate booking key" };
  }
}

// ─── Update Profile ────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(2, "Role is required"),
  city: z.string().optional().default(""),
  country: z.string().min(2, "Country is required"),
  bio: z.string().max(500).optional().default(""),
  dayRate: z.coerce.number().min(0).optional(),
  rateIncludesEquipment: z.string().optional(),
  equipment: z.string().optional().default(""),
  languages: z.string().optional().default(""),
  vimeoUrl: z.string().optional().default(""),
  youtubeUrl: z.string().optional().default(""),
  imdbUrl: z.string().optional().default(""),
  websiteUrl: z.string().optional().default(""),
});

export async function updateProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const raw = {
    name: formData.get("name"),
    role: formData.get("role"),
    city: formData.get("city"),
    country: formData.get("country"),
    bio: formData.get("bio"),
    dayRate: formData.get("dayRate"),
    rateIncludesEquipment: formData.get("rateIncludesEquipment"),
    equipment: formData.get("equipment"),
    languages: formData.get("languages"),
    vimeoUrl: formData.get("vimeoUrl"),
    youtubeUrl: formData.get("youtubeUrl"),
    imdbUrl: formData.get("imdbUrl"),
    websiteUrl: formData.get("websiteUrl"),
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  try {
    // Convert dayRate EUR → cents
    const dayRateCents = data.dayRate && data.dayRate > 0 ? Math.round(data.dayRate * 100) : null;

    await prisma.crewProfile.update({
      where: { userId },
      data: {
        name: data.name,
        role: data.role,
        city: data.city || null,
        country: data.country,
        bio: data.bio || null,
        dayRate: dayRateCents,
        rateIncludesEquipment: data.rateIncludesEquipment === "on",
        equipment: data.equipment || null,
        languages: data.languages || null,
        vimeoUrl: data.vimeoUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        imdbUrl: data.imdbUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
    });

    // Also update user name
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });

    logger.info({ userId }, "crew:update_profile");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "crew:update_profile_error");
    return { success: false, error: "Failed to update profile" };
  }
}
