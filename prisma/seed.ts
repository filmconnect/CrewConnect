import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CrewConnect...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.videoClip.deleteMany();
  await prisma.crewProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // ─── Marko Horvat (DP) ──────────────────────────────────

  const marko = await prisma.user.create({
    data: {
      email: "marko@example.com",
      passwordHash,
      name: "Marko Horvat",
      role: "crew",
      crewProfile: {
        create: {
          name: "Marko Horvat",
          slug: "marko-horvat",
          bookingKey: "x7k9m",
          role: "Director of Photography",
          city: "Zagreb",
          country: "Croatia",
          bio: "Award-winning DP with 12+ years of experience in commercials, documentaries, and narrative film. Known for natural lighting and handheld work. Available for international projects.",
          dayRate: 55000, // €550 in cents
          rateIncludesEquipment: true,
          equipment: "ARRI Alexa Mini LF, Cooke S4/i Prime Set, DJI Ronin 2, Easyrig Vario 5, Tiffen Filters",
          languages: "Croatian, English, German",
          vimeoUrl: "https://vimeo.com/markohrvat",
          imdbUrl: "https://www.imdb.com/name/nm1234567",
          websiteUrl: "https://markohorvat.com",
          legalName: "Marko Horvat",
          address: "Ilica 42, 10000 Zagreb, Croatia",
          vatNumber: "HR12345678901",
          iban: "HR1234567890123456789",
          paymentTerms: "Net 14",
          plan: "pro",
          showDayRate: true,
          showAvailability: true,
          clips: {
            create: [
              {
                title: "BMW 3 Series — Alpine Drive",
                description: "Commercial spot for BMW Germany. Shot on ARRI Alexa Mini LF with Cooke S4s.",
                url: "https://vimeo.com/123456789",
                sortOrder: 0,
                isFeatured: true,
              },
              {
                title: "Adidas Originals — Street Culture Zagreb",
                description: "Brand film for Adidas. Natural light, documentary style.",
                url: "https://vimeo.com/234567890",
                sortOrder: 1,
                isFeatured: false,
              },
              {
                title: "The Last Summer — Short Film",
                description: "Award-winning short. Official selection at Zagreb Film Festival 2025.",
                url: "https://vimeo.com/345678901",
                sortOrder: 2,
                isFeatured: false,
              },
            ],
          },
          credits: {
            create: [
              { year: 2026, projectName: "Mercedes EQS", format: "Commercial", role: "Director of Photography", director: "Klaus Weber", agency: "Serviceplan" },
              { year: 2025, projectName: "BMW 3 Series — Alpine Drive", format: "Commercial", role: "Director of Photography", director: "Thomas Müller", agency: "Jung von Matt" },
              { year: 2025, projectName: "Adidas Originals — Street Culture", format: "Brand Film", role: "Director of Photography", director: "Ivan Perić" },
              { year: 2025, projectName: "Croatian Tourism — Hidden Gems", format: "Campaign", role: "Director of Photography", director: "Ana Marić", agency: "Imago" },
              { year: 2025, projectName: "The Last Summer", format: "Short Film", role: "Director of Photography", director: "Luka Kovačević" },
              { year: 2024, projectName: "Heineken — Game Day", format: "Commercial", role: "Director of Photography", director: "Mark de Vries", agency: "Publicis" },
              { year: 2024, projectName: "Samsung Galaxy S24", format: "Commercial", role: "Director of Photography", director: "Kim Soo-min" },
              { year: 2024, projectName: "Podravka — Taste of Home", format: "Commercial", role: "Director of Photography", director: "Maja Štimac", agency: "Bruketa&Žinić" },
              { year: 2023, projectName: "Nike Running — Zagreb Marathon", format: "Brand Film", role: "Director of Photography", director: "Ivan Perić" },
              { year: 2023, projectName: "Rimac Nevera Launch", format: "Launch Film", role: "Director of Photography", director: "Mate Rimac" },
              { year: 2023, projectName: "Lost in Translation: Zagreb", format: "Documentary", role: "Director of Photography", director: "Helena Babić" },
              { year: 2022, projectName: "Coca-Cola Summer", format: "Commercial", role: "A Camera Operator", director: "James Smith", agency: "McCann" },
            ],
          },
          bookings: {
            create: [
              {
                title: "Mercedes EQS — Coastal Drive",
                client: "Serviceplan Munich",
                startDate: new Date("2026-04-21"),
                endDate: new Date("2026-04-24"),
                dayRate: 60000,
                status: "confirmed",
              },
              {
                title: "Croatian Tourism 2026",
                client: "HTZ",
                startDate: new Date("2026-05-05"),
                endDate: new Date("2026-05-09"),
                dayRate: 50000,
                status: "confirmed",
              },
            ],
          },
          blockedDates: {
            create: [
              { date: new Date("2026-04-28") },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Created Marko Horvat (${marko.email})`);

  // ─── Ana Kovač (Sound Mixer) ─────────────────────────────

  const ana = await prisma.user.create({
    data: {
      email: "ana@example.com",
      passwordHash,
      name: "Ana Kovač",
      role: "crew",
      crewProfile: {
        create: {
          name: "Ana Kovač",
          slug: "ana-kovac",
          bookingKey: "p3r8w",
          role: "Sound Mixer",
          city: "Ljubljana",
          country: "Slovenia",
          bio: "Production sound mixer specializing in commercials and documentaries. 8 years of experience across Europe. Fluent in Slovenian, Croatian, English, and Italian.",
          dayRate: 40000, // €400 in cents
          rateIncludesEquipment: true,
          equipment: "Sound Devices 888, Sennheiser MKH 416, Schoeps CMIT 5U, Lectrosonics SRc, DPA 4098",
          languages: "Slovenian, Croatian, English, Italian",
          plan: "free",
          showDayRate: true,
          showAvailability: true,
          clips: {
            create: [
              {
                title: "Behind the Sound — Documentary BTS",
                description: "A look at production sound recording on a feature documentary.",
                url: "https://vimeo.com/456789012",
                sortOrder: 0,
                isFeatured: true,
              },
            ],
          },
          credits: {
            create: [
              { year: 2025, projectName: "Slovenian Wine Country", format: "Documentary", role: "Sound Mixer", director: "Janez Novak" },
              { year: 2025, projectName: "Gorenje — Kitchen Stories", format: "Commercial", role: "Sound Mixer", director: "Petra Kos", agency: "Luna TBWA" },
              { year: 2024, projectName: "Triglav Insurance", format: "Commercial", role: "Sound Mixer", director: "Boštjan Hladnik", agency: "Pristop" },
              { year: 2024, projectName: "Lake Bled — Eternal Beauty", format: "Tourism Film", role: "Sound Mixer", director: "Maja Weiss" },
              { year: 2023, projectName: "The Bridge", format: "Short Film", role: "Sound Mixer", director: "Damjan Kozole" },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Created Ana Kovač (${ana.email})`);

  // ─── Pending booking request for Marko ───────────────────

  const markoProfile = await prisma.crewProfile.findUnique({
    where: { userId: marko.id },
  });

  if (markoProfile) {
    await prisma.bookingRequest.create({
      data: {
        profileId: markoProfile.id,
        producerName: "Eva Mueller",
        producerCompany: "Serviceplan Munich",
        producerEmail: "eva@serviceplan.com",
        producerPhone: "+49 171 1234567",
        producerVat: "DE123456789",
        projectName: "BMW 5 Series — Coastal Drive",
        role: "Director of Photography",
        startDate: new Date("2026-04-15"),
        endDate: new Date("2026-04-18"),
        offeredRate: 60000, // €600/day in cents
        message: "Hi Marko, we loved your work on the BMW 3 Series spot. We'd like to book you for the new 5 Series campaign shooting along the Croatian coast. 4 shoot days, full crew provided. Looking forward to working with you again!",
        status: "pending",
      },
    });

    console.log("✅ Created pending booking request (BMW 5 Series → Marko)");
  }

  console.log("\n🎬 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Logins:");
  console.log("  marko@example.com / password123");
  console.log("  ana@example.com   / password123");
  console.log("─────────────────────────────────");
  console.log("Public:  /crew/marko-horvat");
  console.log("Private: /crew/marko-horvat?key=x7k9m");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
