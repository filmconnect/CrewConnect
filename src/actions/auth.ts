"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth";
import { generateSlug, generateBookingKey } from "@/lib/slug";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

// ─── Schemas ───────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role is required"),
  country: z.string().min(2, "Country is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ─── Signup ────────────────────────────────────────────────

export async function signup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    role: formData.get("role"),
    country: formData.get("country"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, role, country, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = await generateSlug(name);
    const bookingKey = generateBookingKey();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "crew",
        crewProfile: {
          create: {
            name,
            slug,
            bookingKey,
            role,
            country,
          },
        },
      },
    });

    await createSession(user.id);
    logger.info({ userId: user.id, email, slug }, "auth:signup");
  } catch (err) {
    logger.error({ err }, "auth:signup_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard/profile");
}

// ─── Login ─────────────────────────────────────────────────

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid email or password" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    await createSession(user.id);
    logger.info({ userId: user.id, email }, "auth:login");
  } catch (err) {
    logger.error({ err }, "auth:login_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

// ─── Logout ────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/auth/login");
}

// ─── Forgot Password ──────────────────────────────────────

export async function forgotPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get("email") };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordReset.create({
        data: { userId: user.id, token, expiresAt },
      });

      // MVP: log the reset link (no email service yet)
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
      logger.info({ email, resetUrl }, "auth:forgot_password");
    }

    return { success: true };
  } catch (err) {
    logger.error({ err }, "auth:forgot_password_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ─── Reset Password ───────────────────────────────────────

export async function resetPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { token, password } = parsed.data;

  try {
    const reset = await prisma.passwordReset.findUnique({ where: { token } });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired reset link" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: reset.userId } }),
    ]);

    logger.info({ userId: reset.userId }, "auth:reset_password");
    return { success: true };
  } catch (err) {
    logger.error({ err }, "auth:reset_password_error");
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
