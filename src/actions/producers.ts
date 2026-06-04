"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createProducerSession, deleteProducerSession, requireProducer } from "@/lib/producer-auth";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

// ─── Schemas ───────────────────────────────────────────────

const requestAccessSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  website: z.string().url().optional().or(z.literal("")),
  produces: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

const signinSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─── Request Access ────────────────────────────────────────

export async function requestProducerAccess(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    role: formData.get("role"),
    website: formData.get("website"),
    produces: formData.get("produces"),
    message: formData.get("message"),
  };

  const parsed = requestAccessSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, company, role, website, produces } = parsed.data;

  try {
    const existing = await prisma.producer.findUnique({ where: { email } });
    if (existing) {
      if (existing.status === "APPROVED") {
        return { success: false, error: "You already have an account. Please sign in." };
      }
      return { success: false, error: "Your request is already being reviewed." };
    }

    const producesArray = produces
      ? produces.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    await prisma.producer.create({
      data: {
        name,
        email,
        company,
        role,
        website: website || null,
        produces: producesArray,
        status: "REQUESTED",
      },
    });

    logger.info({ email, company }, "producer:request_access");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "producer:request_access_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Sign In ───────────────────────────────────────────────

export async function producerSignin(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signinSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  try {
    const producer = await prisma.producer.findUnique({ where: { email } });

    if (!producer || !producer.passwordHash) {
      return { success: false, error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(password, producer.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password." };
    }

    if (producer.status !== "APPROVED") {
      return {
        success: false,
        error: producer.status === "REQUESTED"
          ? "Your access request is still being reviewed."
          : "Your account is not active. Please contact support.",
      };
    }

    await createProducerSession(producer.id);
    logger.info({ producerId: producer.id, email }, "producer:signin");
  } catch (err) {
    logger.error({ err }, "producer:signin_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/producers/home");
}

// ─── Sign Out ──────────────────────────────────────────────

export async function producerSignout(): Promise<void> {
  await deleteProducerSession();
  redirect("/producers");
}

// ─── Toggle Saved Crew ─────────────────────────────────────

export async function toggleSavedCrew(crewProfileId: string): Promise<ActionResult<boolean>> {
  const { producerId } = await requireProducer();

  try {
    const existing = await prisma.savedCrew.findUnique({
      where: {
        producerId_crewProfileId: { producerId, crewProfileId },
      },
    });

    if (existing) {
      await prisma.savedCrew.delete({ where: { id: existing.id } });
      logger.info({ producerId, crewProfileId }, "producer:unsaved_crew");
      revalidatePath("/producers/search");
      return { success: true, data: false };
    } else {
      await prisma.savedCrew.create({
        data: { producerId, crewProfileId },
      });
      logger.info({ producerId, crewProfileId }, "producer:saved_crew");
      revalidatePath("/producers/search");
      return { success: true, data: true };
    }
  } catch (err) {
    logger.error({ err }, "producer:toggle_saved_error");
    return { success: false, error: "Failed to save crew member." };
  }
}
