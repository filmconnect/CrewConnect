import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import logger from "./logger";
import { redirect } from "next/navigation";

const PRODUCER_COOKIE = "cc_producer_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createProducerSession(producerId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await new SignJWT({ producerId, type: "producer" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getJwtSecret());

  await prisma.producerSession.create({
    data: { producerId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(PRODUCER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  logger.info({ producerId }, "producer_session:created");
  return token;
}

export async function getProducerSession(): Promise<{
  producerId: string;
  producer: {
    id: string;
    email: string;
    name: string;
    company: string;
    role: string;
    status: string;
  };
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PRODUCER_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "producer") return null;

    const producerId = payload.producerId as string;

    const session = await prisma.producerSession.findUnique({
      where: { token },
      include: {
        producer: {
          select: {
            id: true,
            email: true,
            name: true,
            company: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.producerSession.delete({ where: { id: session.id } });
      }
      return null;
    }

    return { producerId, producer: session.producer };
  } catch {
    return null;
  }
}

export async function deleteProducerSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PRODUCER_COOKIE)?.value;

  if (token) {
    await prisma.producerSession.deleteMany({ where: { token } });
    cookieStore.delete(PRODUCER_COOKIE);
    logger.info("producer_session:deleted");
  }
}

export async function requireProducer(): Promise<{
  producerId: string;
  producer: {
    id: string;
    email: string;
    name: string;
    company: string;
    role: string;
    status: string;
  };
}> {
  const session = await getProducerSession();
  if (!session) {
    redirect("/producers/signin");
  }
  if (session.producer.status !== "APPROVED") {
    redirect("/producers?status=pending");
  }
  return session;
}
