// prisma/seed-producers.ts
// Run: npx tsx prisma/seed-producers.ts
//
// Seeds:
//   1. Producer accounts (test logins for /producers/signin)
//   2. 20 crew profiles + users + credits — the demo data the AI search
//      ranks. Mirrors the constants in src/app/api/producers/search/route.ts
//
// Idempotent: re-runs upsert producers and update-or-skip crew (existing
// slugs keep their original User/email, but profile fields and credits
// are refreshed to match this file).
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Crew seed data ──────────────────────────────────────────

interface CrewSeed {
  slug: string;
  name: string;
  role: string;
  city: string;
  country: string;
  dayRateCents: number;
  rateInclEquipment: boolean;
  equipment: string[];
  languages: string[];
  ccRank: number;
  credits: { project: string; year: number; format: string; role: string }[];
}

const CREW_SEED: CrewSeed[] = [
  // 5 DPs
  {
    slug: "marko-horvat", name: "Marko Horvat", role: "Director of Photography",
    city: "Zagreb", country: "Croatia", dayRateCents: 65000, rateInclEquipment: true,
    equipment: ["ARRI Alexa Mini LF", "Zeiss Supreme Primes", "DJI Ronin 2"],
    languages: ["Croatian", "English", "German"], ccRank: 94,
    credits: [
      { project: "Audi Q6 e-tron", year: 2026, format: "automotive", role: "DP" },
      { project: "Filmosaur Winter", year: 2025, format: "automotive", role: "DP" },
      { project: "BMW M5 Launch", year: 2025, format: "automotive", role: "DP" },
      { project: "Skoda Electric Future", year: 2025, format: "commercial", role: "DP" },
      { project: "Tourism Croatia Summer", year: 2025, format: "commercial", role: "DP" },
    ],
  },
  {
    slug: "ana-babic", name: "Ana Babic", role: "Director of Photography",
    city: "Zagreb", country: "Croatia", dayRateCents: 70000, rateInclEquipment: false,
    equipment: ["ARRI Alexa Mini", "Cooke S4"],
    languages: ["Croatian", "English"], ccRank: 81,
    credits: [
      { project: "Volkswagen Tiguan Reveal", year: 2025, format: "automotive", role: "DP" },
      { project: "Renault Captur Spring", year: 2025, format: "automotive", role: "DP" },
      { project: "Hyundai Tucson Drive", year: 2024, format: "automotive", role: "DP" },
      { project: "Kia EV6 Launch", year: 2024, format: "automotive", role: "DP" },
    ],
  },
  {
    slug: "ivan-peric", name: "Ivan Peric", role: "Director of Photography",
    city: "Rijeka", country: "Croatia", dayRateCents: 55000, rateInclEquipment: false,
    equipment: ["Sony Venice 2", "Leica Summicron-C"],
    languages: ["Croatian", "Italian"], ccRank: 62,
    credits: [
      { project: "Adriatic Lives", year: 2025, format: "documentary", role: "DP" },
      { project: "Coastal Drive", year: 2024, format: "automotive", role: "DP" },
      { project: "Salt Roads", year: 2024, format: "documentary", role: "DP" },
      { project: "Adriatic Coast", year: 2022, format: "automotive", role: "DP" },
    ],
  },
  {
    slug: "lars-hansen", name: "Lars Hansen", role: "Director of Photography",
    city: "Copenhagen", country: "Denmark", dayRateCents: 60000, rateInclEquipment: false,
    equipment: ["RED Komodo", "Sigma Cine Primes", "Ronin RS3 Pro"],
    languages: ["Danish", "English", "Swedish"], ccRank: 85,
    credits: [
      { project: "Mø — Final Song", year: 2025, format: "music_video", role: "DP" },
      { project: "Carlsberg Probably", year: 2025, format: "commercial", role: "DP" },
      { project: "Lukas Graham — Home", year: 2024, format: "music_video", role: "DP" },
      { project: "Volvo XC90 Recharge", year: 2024, format: "automotive", role: "DP" },
      { project: "Bang & Olufsen Beosound", year: 2024, format: "commercial", role: "DP" },
    ],
  },
  {
    slug: "sofia-romano", name: "Sofia Romano", role: "Director of Photography",
    city: "Milan", country: "Italy", dayRateCents: 75000, rateInclEquipment: true,
    equipment: ["ARRI Alexa 35", "Cooke S7/i Full Frame", "DJI Ronin 2"],
    languages: ["Italian", "English", "French"], ccRank: 88,
    credits: [
      { project: "Prada SS26 Campaign", year: 2026, format: "commercial", role: "DP" },
      { project: "Ferrari Roma — Esprit", year: 2025, format: "automotive", role: "DP" },
      { project: "Gucci Bloom", year: 2025, format: "commercial", role: "DP" },
      { project: "Maserati GT2 Reveal", year: 2025, format: "automotive", role: "DP" },
      { project: "Bulgari — Roma", year: 2024, format: "lifestyle", role: "DP" },
      { project: "Fiat 500e Heritage", year: 2024, format: "automotive", role: "DP" },
    ],
  },

  // 3 Gaffers
  {
    slug: "tomas-novak", name: "Tomáš Novák", role: "Gaffer",
    city: "Prague", country: "Czech Republic", dayRateCents: 40000, rateInclEquipment: false,
    equipment: ["ARRI SkyPanel S60", "ARRI M40", "Aputure Nova P300c"],
    languages: ["Czech", "English", "German"], ccRank: 76,
    credits: [
      { project: "Škoda Enyaq Coupé", year: 2025, format: "commercial", role: "Gaffer" },
      { project: "Pilsner Urquell — Origin", year: 2025, format: "commercial", role: "Gaffer" },
      { project: "Mercedes EQS Night Drive", year: 2024, format: "automotive", role: "Gaffer" },
      { project: "Heineken — UEFA", year: 2024, format: "commercial", role: "Gaffer" },
    ],
  },
  {
    slug: "pierre-dubois", name: "Pierre Dubois", role: "Gaffer",
    city: "Lyon", country: "France", dayRateCents: 45000, rateInclEquipment: true,
    equipment: ["ARRI SkyPanel S60", "ARRI M18", "Kino Flo Diva-Lite", "Dimmer Board"],
    languages: ["French", "English"], ccRank: 71,
    credits: [
      { project: "Peugeot 408 GT", year: 2026, format: "automotive", role: "Gaffer" },
      { project: "Renault Scenic E-Tech", year: 2025, format: "automotive", role: "Gaffer" },
      { project: "Citroën C5 X", year: 2024, format: "automotive", role: "Gaffer" },
    ],
  },
  {
    slug: "klaus-wagner", name: "Klaus Wagner", role: "Gaffer",
    city: "Berlin", country: "Germany", dayRateCents: 38000, rateInclEquipment: false,
    equipment: ["ARRI SkyPanel S30", "Litepanels Gemini 2x1", "Astera Titan Tubes"],
    languages: ["German", "English"], ccRank: 65,
    credits: [
      { project: "Berlinale Doc — Wall Stories", year: 2025, format: "documentary", role: "Gaffer" },
      { project: "ZDF — Climate Lines", year: 2025, format: "documentary", role: "Gaffer" },
      { project: "Arte — Europe at Night", year: 2024, format: "documentary", role: "Gaffer" },
    ],
  },

  // 2 Sound Mixers
  {
    slug: "eva-lindqvist", name: "Eva Lindqvist", role: "Sound Mixer",
    city: "Stockholm", country: "Sweden", dayRateCents: 50000, rateInclEquipment: true,
    equipment: ["Sound Devices 833", "Sennheiser MKH 416", "DPA 4060", "Lectrosonics SMQV"],
    languages: ["Swedish", "English", "Norwegian"], ccRank: 78,
    credits: [
      { project: "SVT — Arctic Lives", year: 2025, format: "documentary", role: "Sound Mixer" },
      { project: "Nordic Noir — Season 4", year: 2025, format: "series", role: "Sound Mixer" },
      { project: "Vasa — The Wreck", year: 2024, format: "documentary", role: "Sound Mixer" },
      { project: "Ikea Family", year: 2024, format: "commercial", role: "Sound Mixer" },
    ],
  },
  {
    slug: "diego-fernandez", name: "Diego Fernández", role: "Sound Mixer",
    city: "Barcelona", country: "Spain", dayRateCents: 42000, rateInclEquipment: false,
    equipment: ["Zoom F8n Pro", "Rode NTG3", "Sennheiser EW 500"],
    languages: ["Spanish", "Catalan", "English"], ccRank: 68,
    credits: [
      { project: "Rosalía — Despechá Live", year: 2025, format: "music_video", role: "Sound Mixer" },
      { project: "C. Tangana — Rooftop", year: 2024, format: "music_video", role: "Sound Mixer" },
      { project: "Estrella Damm — Mediterráneo", year: 2024, format: "commercial", role: "Sound Mixer" },
    ],
  },

  // 2 Editors
  {
    slug: "mateusz-kowalski", name: "Mateusz Kowalski", role: "Editor",
    city: "Warsaw", country: "Poland", dayRateCents: 35000, rateInclEquipment: true,
    equipment: ["DaVinci Resolve Studio", "Adobe Premiere Pro", "Avid Media Composer"],
    languages: ["Polish", "English"], ccRank: 55,
    credits: [
      { project: "TVP — Solidarność at 45", year: 2025, format: "documentary", role: "Editor" },
      { project: "Warsaw Rising — Voices", year: 2024, format: "documentary", role: "Editor" },
      { project: "Cold Front", year: 2024, format: "feature", role: "Editor" },
    ],
  },
  {
    slug: "chiara-bianchi", name: "Chiara Bianchi", role: "Editor",
    city: "Rome", country: "Italy", dayRateCents: 45000, rateInclEquipment: true,
    equipment: ["Adobe Premiere Pro", "DaVinci Resolve Studio", "After Effects"],
    languages: ["Italian", "English"], ccRank: 72,
    credits: [
      { project: "Lavazza — A Modo Mio", year: 2025, format: "commercial", role: "Editor" },
      { project: "Barilla — Family Tables", year: 2025, format: "commercial", role: "Editor" },
      { project: "Alfa Romeo Tonale", year: 2024, format: "automotive", role: "Editor" },
      { project: "Campari — Red Diaries", year: 2024, format: "commercial", role: "Editor" },
    ],
  },

  // 2 Drone Operators
  {
    slug: "filip-larsson", name: "Filip Larsson", role: "Drone Operator",
    city: "Oslo", country: "Norway", dayRateCents: 55000, rateInclEquipment: true,
    equipment: ["DJI Inspire 3", "Freefly Alta X", "DJI Mavic 3 Cine"],
    languages: ["Norwegian", "English", "Swedish"], ccRank: 80,
    credits: [
      { project: "Volvo EX90 — Fjord", year: 2025, format: "automotive", role: "Drone Operator" },
      { project: "Polestar 4 Launch", year: 2025, format: "automotive", role: "Drone Operator" },
      { project: "Norway Tourism — Lofoten", year: 2024, format: "commercial", role: "Drone Operator" },
      { project: "Audi Q8 Winter Test", year: 2024, format: "automotive", role: "Drone Operator" },
    ],
  },
  {
    slug: "marija-petrovic", name: "Marija Petrović", role: "Drone Operator",
    city: "Belgrade", country: "Serbia", dayRateCents: 40000, rateInclEquipment: true,
    equipment: ["DJI Mavic 3 Cine", "DJI Inspire 2"],
    languages: ["Serbian", "English"], ccRank: 58,
    credits: [
      { project: "Bajaga — Plavi Safir", year: 2025, format: "music_video", role: "Drone Operator" },
      { project: "EXIT Festival 2025", year: 2025, format: "music_video", role: "Drone Operator" },
      { project: "Serbia Untold", year: 2024, format: "documentary", role: "Drone Operator" },
    ],
  },

  // 2 Camera Operators
  {
    slug: "hugo-van-dijk", name: "Hugo van Dijk", role: "Camera Operator",
    city: "Amsterdam", country: "Netherlands", dayRateCents: 48000, rateInclEquipment: false,
    equipment: ["ARRI Alexa Mini", "Easyrig Vario 5", "MoVI Pro"],
    languages: ["Dutch", "English", "German"], ccRank: 70,
    credits: [
      { project: "Heineken — Cheers To All", year: 2025, format: "commercial", role: "Camera Operator" },
      { project: "ING — Future Banking", year: 2025, format: "commercial", role: "Camera Operator" },
      { project: "Philips — Sleep Better", year: 2024, format: "commercial", role: "Camera Operator" },
      { project: "KLM 105 — Together", year: 2024, format: "commercial", role: "Camera Operator" },
    ],
  },
  {
    slug: "andrea-schmidt", name: "Andrea Schmidt", role: "Camera Operator",
    city: "Vienna", country: "Austria", dayRateCents: 46000, rateInclEquipment: false,
    equipment: ["Sony FX9", "Ronin RS3 Pro", "Tilta Nucleus-M"],
    languages: ["German", "English"], ccRank: 60,
    credits: [
      { project: "ORF — Donau Stories", year: 2025, format: "documentary", role: "Camera Operator" },
      { project: "Vienna Philharmonic — On Tour", year: 2024, format: "documentary", role: "Camera Operator" },
      { project: "Mozart — A Vienna Year", year: 2024, format: "documentary", role: "Camera Operator" },
    ],
  },

  // 2 First ADs
  {
    slug: "james-oconnor", name: "James O'Connor", role: "1st AD",
    city: "Dublin", country: "Ireland", dayRateCents: 55000, rateInclEquipment: false,
    equipment: ["Movie Magic Scheduling", "StudioBinder"],
    languages: ["English", "Irish"], ccRank: 82,
    credits: [
      { project: "Guinness — Made of More", year: 2025, format: "commercial", role: "1st AD" },
      { project: "Jameson — Sine Metu", year: 2025, format: "commercial", role: "1st AD" },
      { project: "Ryanair — Always Getting Better", year: 2024, format: "commercial", role: "1st AD" },
      { project: "Tourism Ireland — Wild Atlantic", year: 2024, format: "commercial", role: "1st AD" },
    ],
  },
  {
    slug: "lucia-hernandez", name: "Lucía Hernández", role: "1st AD",
    city: "Madrid", country: "Spain", dayRateCents: 52000, rateInclEquipment: false,
    equipment: ["StudioBinder", "Movie Magic"],
    languages: ["Spanish", "English"], ccRank: 75,
    credits: [
      { project: "SEAT Leon Cupra", year: 2025, format: "automotive", role: "1st AD" },
      { project: "Cupra Tavascan", year: 2025, format: "automotive", role: "1st AD" },
      { project: "Iberia — Hub Madrid", year: 2024, format: "commercial", role: "1st AD" },
    ],
  },

  // 1 Colorist
  {
    slug: "niko-virtanen", name: "Niko Virtanen", role: "Colorist",
    city: "Helsinki", country: "Finland", dayRateCents: 80000, rateInclEquipment: true,
    equipment: ["Baselight ONE", "DaVinci Resolve Studio", "Flanders DM250 HDR Monitor"],
    languages: ["Finnish", "English", "Swedish"], ccRank: 90,
    credits: [
      { project: "Nokia — Pure Black", year: 2025, format: "commercial", role: "Colorist" },
      { project: "Marimekko — Print Stories", year: 2025, format: "commercial", role: "Colorist" },
      { project: "Kalevala — The Series", year: 2025, format: "series", role: "Colorist" },
      { project: "Wolt — Late Night", year: 2024, format: "commercial", role: "Colorist" },
      { project: "Linnanmäki", year: 2024, format: "commercial", role: "Colorist" },
    ],
  },

  // 1 Steadicam Operator
  {
    slug: "stefan-schubert", name: "Stefan Schubert", role: "Steadicam Operator",
    city: "Munich", country: "Germany", dayRateCents: 90000, rateInclEquipment: true,
    equipment: ["Tiffen Steadicam M1", "Tilta Stabilizer", "Easyrig Vario 5"],
    languages: ["German", "English"], ccRank: 92,
    credits: [
      { project: "BMW iX — One Take", year: 2026, format: "automotive", role: "Steadicam Op" },
      { project: "Mercedes EQE — Salon Drive", year: 2025, format: "automotive", role: "Steadicam Op" },
      { project: "Audi RS6 — Night Run", year: 2025, format: "automotive", role: "Steadicam Op" },
      { project: "Porsche 911 GT3 RS", year: 2024, format: "automotive", role: "Steadicam Op" },
      { project: "Adidas Originals — Run It", year: 2024, format: "commercial", role: "Steadicam Op" },
    ],
  },
];

function randomBookingKey(): string {
  return Math.random().toString(36).slice(2, 7);
}

async function generateUniqueBookingKey(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const key = randomBookingKey();
    const clash = await prisma.crewProfile.findUnique({ where: { bookingKey: key } });
    if (!clash) return key;
  }
  throw new Error("Could not generate a unique bookingKey after 10 tries");
}

async function seedCrew() {
  console.log("Seeding crew profiles...");
  let created = 0;
  let updated = 0;

  for (const seed of CREW_SEED) {
    const profileData: Prisma.CrewProfileUncheckedUpdateInput = {
      name: seed.name,
      role: seed.role,
      city: seed.city,
      country: seed.country,
      dayRate: seed.dayRateCents,
      rateIncludesEquipment: seed.rateInclEquipment,
      equipment: seed.equipment.join(", "),
      languages: seed.languages.join(", "),
      ccRank: seed.ccRank,
      claimed: true,
    };

    const existing = await prisma.crewProfile.findUnique({
      where: { slug: seed.slug },
    });

    let profileId: string;
    if (existing) {
      await prisma.crewProfile.update({
        where: { id: existing.id },
        data: profileData,
      });
      profileId = existing.id;
      updated++;
    } else {
      const user = await prisma.user.create({
        data: {
          email: `${seed.slug}@crew.example.com`,
          name: seed.name,
          role: "crew",
        },
      });
      const profile = await prisma.crewProfile.create({
        data: {
          ...profileData,
          userId: user.id,
          slug: seed.slug,
          bookingKey: await generateUniqueBookingKey(),
        } as Prisma.CrewProfileUncheckedCreateInput,
      });
      profileId = profile.id;
      created++;
    }

    // Refresh seed-managed credits only — leave any user-added credits alone
    await prisma.credit.deleteMany({
      where: { profileId, status: "seed" },
    });
    await prisma.credit.createMany({
      data: seed.credits.map((c) => ({
        profileId,
        year: c.year,
        projectName: c.project,
        format: c.format,
        role: c.role,
        status: "seed",
      })),
    });
  }

  console.log(`   ${created} created, ${updated} updated, ${CREW_SEED.length} total`);
}

async function main() {
  console.log("Seeding producers...");

  const passwordHash = await bcrypt.hash("producer123", 10);

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

  console.log("Producers seeded:");
  console.log("   eva@serviceplan.com / producer123 (APPROVED)");
  console.log("   marco@saatchi.com / producer123 (APPROVED)");
  console.log("   pending@example.com (REQUESTED, no password)");

  await seedCrew();

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
