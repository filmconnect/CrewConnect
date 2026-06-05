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
    copenhagen: { lat: 55.676, lng: 12.568 },
    milan: { lat: 45.464, lng: 9.190 },
    prague: { lat: 50.075, lng: 14.437 },
    lyon: { lat: 45.764, lng: 4.835 },
    stockholm: { lat: 59.329, lng: 18.068 },
    barcelona: { lat: 41.385, lng: 2.173 },
    warsaw: { lat: 52.229, lng: 21.012 },
    rome: { lat: 41.902, lng: 12.496 },
    oslo: { lat: 59.913, lng: 10.752 },
    belgrade: { lat: 44.787, lng: 20.457 },
    amsterdam: { lat: 52.367, lng: 4.904 },
    dublin: { lat: 53.349, lng: -6.260 },
    madrid: { lat: 40.416, lng: -3.703 },
    helsinki: { lat: 60.169, lng: 24.938 },
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

    const profiles = await prisma.crewProfile.findMany({
      where: { claimed: true },
      include: {
        bookings: { select: { startDate: true, endDate: true, status: true } },
        blockedDates: { select: { date: true } },
        credits: { select: { id: true, projectName: true, year: true, format: true, role: true } },
      },
    });
    const candidates: AICrewProfile[] = profiles.map(toAIProfile);
    logger.info({ count: candidates.length }, "ai_search:loaded_profiles");

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
