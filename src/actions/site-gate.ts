"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import logger from "@/lib/logger";
import type { ActionResult } from "@/types";

const COOKIE = "cc_site_access";
const MAX_AGE_DAYS = 30;

export async function submitAccessCode(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const expected = process.env.SITE_ACCESS_CODE;
  if (!expected) {
    // Gate disabled — no env var configured; let everyone in.
    redirect("/");
  }

  const submitted = String(formData.get("code") ?? "").trim();
  if (!submitted) {
    return { success: false, error: "Please enter an access code." };
  }

  if (submitted !== expected) {
    logger.warn("site_gate:invalid_code");
    return { success: false, error: "Invalid access code." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, submitted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });

  logger.info("site_gate:granted");
  redirect("/");
}
