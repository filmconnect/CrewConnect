import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import logger from "./logger";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "cc_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getJwtSecret());

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  logger.info({ userId }, "session:created");
  return token;
}

export async function getSession(): Promise<{
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    logger.debug("auth:getSession — no cookie found");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.userId as string;

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isAdmin: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        logger.info({ userId }, "auth:session_expired — cleaning up");
        await prisma.session.delete({ where: { id: session.id } });
      } else {
        logger.warn({ userId }, "auth:session_not_found_in_db");
      }
      return null;
    }

    return { userId, user: session.user };
  } catch (err) {
    logger.warn({ err }, "auth:getSession_jwt_verify_failed");
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
    logger.info("session:deleted");
  }
}

export async function requireAuth(): Promise<{
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}> {
  const session = await getSession();
  if (!session) {
    logger.warn("auth:requireAuth — no session, redirecting to login");
    redirect("/auth/login");
  }
  return session;
}
