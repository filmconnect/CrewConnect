import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getUserInfo } from "@/lib/google-oauth";
import { createSession } from "@/lib/auth";
import { generateSlug, generateBookingKey } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "login";
  const error = searchParams.get("error");

  if (error || !code) {
    logger.error({ error }, "google:oauth_error");
    return NextResponse.redirect(
      new URL(`/auth/login?error=google_auth_failed`, request.url)
    );
  }

  try {
    const tokens = await exchangeCode(code);
    const googleUser = await getUserInfo(tokens.access_token);

    let isNewUser = false;

    // Check if user exists by googleId
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      // Check by email
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: user.avatarUrl || googleUser.picture,
          },
        });
        logger.info({ userId: user.id }, "google:linked_account");
      } else if (state === "signup") {
        // Create new user + crew profile
        const slug = await generateSlug(googleUser.name);
        const bookingKey = generateBookingKey();

        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            googleId: googleUser.id,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
            role: "crew",
            crewProfile: {
              create: {
                name: googleUser.name,
                slug,
                bookingKey,
                role: "Crew Member",
                country: "Unknown",
              },
            },
          },
        });
        isNewUser = true;
        logger.info({ userId: user.id, slug }, "google:signup");
      } else {
        // Login mode but no account exists
        return NextResponse.redirect(
          new URL("/auth/register?error=no_account", request.url)
        );
      }
    }

    await createSession(user.id);
    logger.info({ userId: user.id }, "google:session_created");

    // New users go to profile to complete their info
    const redirectPath = isNewUser ? "/dashboard/profile" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (err) {
    logger.error({ err }, "google:callback_error");
    return NextResponse.redirect(
      new URL("/auth/login?error=google_auth_failed", request.url)
    );
  }
}
