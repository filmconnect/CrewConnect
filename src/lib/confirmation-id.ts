import { prisma } from "./prisma";
import logger from "./logger";

/**
 * Generates a unique confirmation ID in format CC-YYYY-NNNNN
 * Uses a global counter via the highest existing confirmation ID.
 */
export async function generateConfirmationId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CC-${year}-`;

  const latest = await prisma.bookingRequest.findFirst({
    where: {
      confirmationId: { startsWith: prefix },
    },
    orderBy: { confirmationId: "desc" },
    select: { confirmationId: true },
  });

  let nextNumber = 1;
  if (latest?.confirmationId) {
    const numPart = latest.confirmationId.replace(prefix, "");
    nextNumber = parseInt(numPart, 10) + 1;
  }

  const confirmationId = `${prefix}${String(nextNumber).padStart(5, "0")}`;
  logger.info({ confirmationId }, "confirmation:generated");
  return confirmationId;
}
