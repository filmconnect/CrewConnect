import { prisma } from "./prisma";
import crypto from "crypto";
import logger from "./logger";

export async function generateSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[čć]/g, "c")
    .replace(/[š]/g, "s")
    .replace(/[ž]/g, "z")
    .replace(/[đ]/g, "d")
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.crewProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      if (counter > 1) {
        logger.info({ name, slug, attempts: counter }, "slug:collision_resolved");
      }
      return slug;
    }
    slug = `${base}-${counter}`;
    counter++;
  }
}

export function generateBookingKey(): string {
  const key = crypto.randomBytes(4).toString("hex").slice(0, 5);
  logger.debug({ key }, "bookingKey:generated");
  return key;
}
