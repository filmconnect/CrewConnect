// prisma/seed-producers.ts
// Run: npx tsx prisma/seed-producers.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding producers...");

  const passwordHash = await bcrypt.hash("producer123", 10);

  // Test producer 1: Approved
  await prisma.producer.upsert({
    where: { email: "eva@serviceplan.com" },
    update: {},
    create: {
      email: "eva@serviceplan.com",
      name: "Eva Mueller",
      company: "Serviceplan Munich",
      role: "Producer",
      website: "https://serviceplan.com",
      produces: ["automotive", "commercial"],
      status: "APPROVED",
      passwordHash,
    },
  });

  // Test producer 2: Approved
  await prisma.producer.upsert({
    where: { email: "marco@saatchi.com" },
    update: {},
    create: {
      email: "marco@saatchi.com",
      name: "Marco Rossi",
      company: "Saatchi & Saatchi",
      role: "Executive Producer",
      website: "https://saatchi.com",
      produces: ["commercial", "automotive", "lifestyle"],
      status: "APPROVED",
      passwordHash,
    },
  });

  // Test producer 3: Requested (pending)
  await prisma.producer.upsert({
    where: { email: "pending@example.com" },
    update: {},
    create: {
      email: "pending@example.com",
      name: "Pending Producer",
      company: "Test Agency",
      role: "Line Producer",
      produces: ["documentary"],
      status: "REQUESTED",
    },
  });

  console.log("✅ Producers seeded:");
  console.log("   eva@serviceplan.com / producer123 (APPROVED)");
  console.log("   marco@saatchi.com / producer123 (APPROVED)");
  console.log("   pending@example.com (REQUESTED, no password)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
