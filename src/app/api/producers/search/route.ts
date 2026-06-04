import { NextResponse } from "next/server";
import { parseBrief } from "@/lib/ai/parse";
import { runSearch } from "@/lib/ai/scoring";
import { prisma } from "@/lib/prisma";
import { getProducerSession } from "@/lib/producer-auth";
import logger from "@/lib/logger";
import type { CrewProfile as AICrewProfile, MatchContext } from "@/lib/ai/types";

// ── Map Prisma profile to AI engine format ──────────────────

function toAIProfile(profile: {
  id: string;
  slug: string;
  name: string;
  role: string;
  city: string | null;
  country: string;
  dayRate: number | null;
  rateIncludesEquipment: boolean;
  equipment: string | null;
  languages: string | null;
  ccRank: number | null;
  claimed: boolean;
  bookings: { startDate: Date; endDate: Date; status: string }[];
  blockedDates: { date: Date }[];
  credits: { id: string; projectName: string; year: number; format: string; role: string }[];
}): AICrewProfile {
  // Build availability from bookings + blocked dates
  const availability: AICrewProfile["availability"] = [];

  for (const booking of profile.bookings) {
    const d = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    while (d <= end) {
      availability.push({
        date: d.toISOString().slice(0, 10),
        status: booking.status === "confirmed" ? "booked" : "pending",
      });
      d.setDate(d.getDate() + 1);
    }
  }

  for (const bd of profile.blockedDates) {
    availability.push({
      date: new Date(bd.date).toISOString().slice(0, 10),
      status: "booked",
    });
  }

  // Parse equipment string to array
  const equipmentArr = profile.equipment
    ? profile.equipment.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];

  // Parse languages
  const languagesArr = profile.languages
    ? profile.languages.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Map credits to AI format
  const credits = profile.credits.map((c) => ({
    id: c.id,
    project: c.projectName,
    year: c.year,
    format: c.format.toLowerCase().replace(/\s+/g, "_") as AICrewProfile["credits"][0]["format"],
    role: c.role,
  }));

  // City coordinates (simplified — ideally geocode from DB)
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    zagreb: { lat: 45.815, lng: 15.982 },
    split: { lat: 43.508, lng: 16.440 },
    rijeka: { lat: 45.327, lng: 14.442 },
    dubrovnik: { lat: 42.650, lng: 18.094 },
    munich: { lat: 48.135, lng: 11.582 },
    vienna: { lat: 48.208, lng: 16.373 },
    berlin: { lat: 52.520, lng: 13.405 },
    london: { lat: 51.507, lng: -0.128 },
  };

  const cityKey = (profile.city || "zagreb").toLowerCase();
  const coords = cityCoords[cityKey] || { lat: 45.815, lng: 15.982 };

  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    role: profile.role,
    city: profile.city || "Unknown",
    country: profile.country,
    dayRateCents: profile.dayRate || 0,
    rateInclEquipment: profile.rateIncludesEquipment,
    equipment: equipmentArr,
    languages: languagesArr,
    verified: profile.claimed,
    rankScore: profile.ccRank || 50,
    reviewAvg: null,
    reviewCount: 0,
    responseHours: null,
    lat: coords.lat,
    lng: coords.lng,
    availability,
    credits,
  };
}

// ── Seed data fallback (used when DB has no profiles) ───────

const SEED: AICrewProfile[] = [
  {
    id: "seed_marko", slug: "marko-horvat", name: "Marko Horvat", role: "Director of Photography",
    city: "Zagreb", country: "HR", dayRateCents: 65000, rateInclEquipment: true,
    equipment: ["arri alexa mini lf", "zeiss supreme primes", "dji ronin 2"],
    languages: ["Croatian", "English", "German"], verified: true, rankScore: 94,
    reviewAvg: 4.8, reviewCount: 16, responseHours: 2, lat: 45.815, lng: 15.982,
    availability: [],
    credits: [
      { id: "c1", project: "Audi Q6 e-tron", year: 2026, format: "automotive", role: "DP" },
      { id: "c2", project: "Filmosaur Winter", year: 2025, format: "automotive", role: "DP" },
      { id: "c3", project: "BMW M5 Launch", year: 2025, format: "automotive", role: "DP" },
      { id: "c4", project: "Skoda Electric Future", year: 2025, format: "commercial", role: "DP" },
      { id: "c5", project: "Tourism Croatia Summer", year: 2025, format: "commercial", role: "DP" },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `cx${i}`, project: `Auto Campaign ${i + 1}`, year: 2024 - (i % 3), format: "automotive" as const, role: "DP",
      })),
    ],
  },
  {
    id: "seed_ana", slug: "ana-babic", name: "Ana Babic", role: "Director of Photography",
    city: "Zagreb", country: "HR", dayRateCents: 70000, rateInclEquipment: false,
    equipment: ["arri alexa mini", "cooke s4"], languages: ["Croatian", "English"],
    verified: false, rankScore: 81, reviewAvg: 4.6, reviewCount: 9, responseHours: 5,
    lat: 45.81, lng: 15.97, availability: [],
    credits: Array.from({ length: 6 }, (_, i) => ({
      id: `a${i}`, project: `Automotive Spot ${i + 1}`, year: 2025 - (i % 4), format: "automotive" as const, role: "DP",
    })),
  },
  {
    id: "seed_ivan", slug: "ivan-peric", name: "Ivan Peric", role: "Director of Photography",
    city: "Rijeka", country: "HR", dayRateCents: 55000, rateInclEquipment: false,
    equipment: [], languages: ["Croatian"], verified: false, rankScore: 62,
    reviewAvg: null, reviewCount: 2, responseHours: 12, lat: 45.327, lng: 14.442,
    availability: [],
    credits: [
      { id: "i1", project: "City Documentary", year: 2025, format: "documentary", role: "DP" },
      { id: "i2", project: "Coastal Drive", year: 2023, format: "automotive", role: "DP" },
      { id: "i3", project: "Adriatic Coast", year: 2022, format: "automotive", role: "DP" },
    ],
  },
];

// ── POST handler ────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json();
  const { q } = body;

  if (!q || typeof q !== "string") {
    return NextResponse.json({ error: "q (brief text) required" }, { status: 400 });
  }

  try {
    // Parse the brief with AI (or keyword fallback)
    const matchRequest = await parseBrief(q);

    // Try to load real profiles from DB
    let candidates: AICrewProfile[];
    try {
      const profiles = await prisma.crewProfile.findMany({
        where: { claimed: true },
        include: {
          bookings: { select: { startDate: true, endDate: true, status: true } },
          blockedDates: { select: { date: true } },
          credits: { select: { id: true, projectName: true, year: true, format: true, role: true } },
        },
      });

      if (profiles.length > 0) {
        candidates = profiles.map(toAIProfile);
        logger.info({ count: candidates.length }, "ai_search:using_db_profiles");
      } else {
        candidates = SEED;
        logger.info("ai_search:using_seed_data (no profiles in db)");
      }
    } catch {
      candidates = SEED;
      logger.warn("ai_search:using_seed_data (db error)");
    }

    // Context for collaboration signal
    const ctx: MatchContext = { partnerProjects: ["Filmosaur Winter"] };

    // Get producer session for logging
    let producerId: string | undefined;
    try {
      const session = await getProducerSession();
      producerId = session?.producerId;
    } catch {
      // Not logged in — still allow search on gate/demo
    }

    // Run scoring engine
    const results = runSearch(candidates, matchRequest, ctx);

    // Log search query
    try {
      await prisma.searchQuery.create({
        data: {
          producerId: producerId || null,
          rawText: q,
          parsedJson: matchRequest as object,
        },
      });
    } catch {
      logger.warn("ai_search:failed_to_log_query");
    }

    logger.info({ q: q.slice(0, 80), resultCount: results.length, producerId }, "ai_search:completed");

    return NextResponse.json({ request: matchRequest, results });
  } catch (err) {
    logger.error({ err }, "ai_search:error");
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
