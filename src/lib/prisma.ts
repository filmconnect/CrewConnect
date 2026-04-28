import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
          ]
        : [{ emit: "event", level: "error" }],
  });

if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` }, "prisma:query");
  });
}

prisma.$on("error" as never, (e: { message: string }) => {
  logger.error({ message: e.message }, "prisma:error");
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
