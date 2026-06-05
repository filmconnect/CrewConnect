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
  // ── Directors of Photography (5) ──────────────────────────
  {
    id: "seed_marko", slug: "marko-horvat", name: "Marko Horvat", role: "Director of Photography",
    city: "Zagreb", country: "HR", dayRateCents: 65000, rateInclEquipment: true,
    equipment: ["arri alexa mini lf", "zeiss supreme primes", "dji ronin 2"],
    languages: ["Croatian", "English", "German"], verified: true, rankScore: 94,
    reviewAvg: 4.8, reviewCount: 16, responseHours: 2, lat: 45.815, lng: 15.982,
    availability: [],
    credits: [
      { id: "mh1", project: "Audi Q6 e-tron", year: 2026, format: "automotive", role: "DP" },
      { id: "mh2", project: "Filmosaur Winter", year: 2025, format: "automotive", role: "DP" },
      { id: "mh3", project: "BMW M5 Launch", year: 2025, format: "automotive", role: "DP" },
      { id: "mh4", project: "Skoda Electric Future", year: 2025, format: "commercial", role: "DP" },
      { id: "mh5", project: "Tourism Croatia Summer", year: 2025, format: "commercial", role: "DP" },
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `mhx${i}`, project: `Auto Campaign ${i + 1}`, year: 2024 - (i % 3), format: "automotive" as const, role: "DP",
      })),
    ],
  },
  {
    id: "seed_ana", slug: "ana-babic", name: "Ana Babic", role: "Director of Photography",
    city: "Zagreb", country: "HR", dayRateCents: 70000, rateInclEquipment: false,
    equipment: ["arri alexa mini", "cooke s4"], languages: ["Croatian", "English"],
    verified: false, rankScore: 81, reviewAvg: 4.6, reviewCount: 9, responseHours: 5,
    lat: 45.810, lng: 15.970, availability: [],
    credits: Array.from({ length: 6 }, (_, i) => ({
      id: `ab${i}`, project: `Automotive Spot ${i + 1}`, year: 2025 - (i % 4), format: "automotive" as const, role: "DP",
    })),
  },
  {
    id: "seed_ivan", slug: "ivan-peric", name: "Ivan Peric", role: "Director of Photography",
    city: "Rijeka", country: "HR", dayRateCents: 55000, rateInclEquipment: false,
    equipment: ["sony venice 2", "leica summicron-c"], languages: ["Croatian", "Italian"],
    verified: false, rankScore: 62, reviewAvg: null, reviewCount: 2, responseHours: 12,
    lat: 45.327, lng: 14.442, availability: [],
    credits: [
      { id: "ip1", project: "Adriatic Lives", year: 2025, format: "documentary", role: "DP" },
      { id: "ip2", project: "Coastal Drive", year: 2024, format: "automotive", role: "DP" },
      { id: "ip3", project: "Salt Roads", year: 2024, format: "documentary", role: "DP" },
      { id: "ip4", project: "Adriatic Coast", year: 2022, format: "automotive", role: "DP" },
    ],
  },
  {
    id: "seed_lars", slug: "lars-hansen", name: "Lars Hansen", role: "Director of Photography",
    city: "Copenhagen", country: "DK", dayRateCents: 60000, rateInclEquipment: false,
    equipment: ["red komodo", "sigma cine primes", "ronin rs3 pro"],
    languages: ["Danish", "English", "Swedish"], verified: true, rankScore: 85,
    reviewAvg: 4.7, reviewCount: 11, responseHours: 4, lat: 55.676, lng: 12.568,
    availability: [],
    credits: [
      { id: "lh1", project: "Mø — Final Song", year: 2025, format: "music_video", role: "DP" },
      { id: "lh2", project: "Carlsberg Probably", year: 2025, format: "commercial", role: "DP" },
      { id: "lh3", project: "Lukas Graham — Home", year: 2024, format: "music_video", role: "DP" },
      { id: "lh4", project: "Volvo XC90 Recharge", year: 2024, format: "automotive", role: "DP" },
      { id: "lh5", project: "Bang & Olufsen Beosound", year: 2024, format: "commercial", role: "DP" },
    ],
  },
  {
    id: "seed_sofia", slug: "sofia-romano", name: "Sofia Romano", role: "Director of Photography",
    city: "Milan", country: "IT", dayRateCents: 75000, rateInclEquipment: true,
    equipment: ["arri alexa 35", "cooke s7/i full frame", "dji ronin 2"],
    languages: ["Italian", "English", "French"], verified: true, rankScore: 88,
    reviewAvg: 4.9, reviewCount: 14, responseHours: 3, lat: 45.464, lng: 9.190,
    availability: [],
    credits: [
      { id: "sr1", project: "Prada SS26 Campaign", year: 2026, format: "commercial", role: "DP" },
      { id: "sr2", project: "Ferrari Roma — Esprit", year: 2025, format: "automotive", role: "DP" },
      { id: "sr3", project: "Gucci Bloom", year: 2025, format: "commercial", role: "DP" },
      { id: "sr4", project: "Maserati GT2 Reveal", year: 2025, format: "automotive", role: "DP" },
      { id: "sr5", project: "Bulgari — Roma", year: 2024, format: "lifestyle", role: "DP" },
      { id: "sr6", project: "Fiat 500e Heritage", year: 2024, format: "automotive", role: "DP" },
    ],
  },

  // ── Gaffers (3) ───────────────────────────────────────────
  {
    id: "seed_tomas", slug: "tomas-novak", name: "Tomáš Novák", role: "Gaffer",
    city: "Prague", country: "CZ", dayRateCents: 40000, rateInclEquipment: false,
    equipment: ["arri skypanel s60", "arri m40", "aputure nova p300c"],
    languages: ["Czech", "English", "German"], verified: true, rankScore: 76,
    reviewAvg: 4.5, reviewCount: 8, responseHours: 4, lat: 50.075, lng: 14.437,
    availability: [],
    credits: [
      { id: "tn1", project: "Škoda Enyaq Coupé", year: 2025, format: "commercial", role: "Gaffer" },
      { id: "tn2", project: "Pilsner Urquell — Origin", year: 2025, format: "commercial", role: "Gaffer" },
      { id: "tn3", project: "Mercedes EQS Night Drive", year: 2024, format: "automotive", role: "Gaffer" },
      { id: "tn4", project: "Heineken — UEFA", year: 2024, format: "commercial", role: "Gaffer" },
    ],
  },
  {
    id: "seed_pierre", slug: "pierre-dubois", name: "Pierre Dubois", role: "Gaffer",
    city: "Lyon", country: "FR", dayRateCents: 45000, rateInclEquipment: true,
    equipment: ["arri skypanel s60", "arri m18", "kino flo diva-lite", "dimmer board"],
    languages: ["French", "English"], verified: true, rankScore: 71,
    reviewAvg: 4.4, reviewCount: 6, responseHours: 6, lat: 45.764, lng: 4.835,
    availability: [],
    credits: [
      { id: "pd1", project: "Peugeot 408 GT", year: 2026, format: "automotive", role: "Gaffer" },
      { id: "pd2", project: "Renault Scenic E-Tech", year: 2025, format: "automotive", role: "Gaffer" },
      { id: "pd3", project: "Citroën C5 X", year: 2024, format: "automotive", role: "Gaffer" },
    ],
  },
  {
    id: "seed_klaus", slug: "klaus-wagner", name: "Klaus Wagner", role: "Gaffer",
    city: "Berlin", country: "DE", dayRateCents: 38000, rateInclEquipment: false,
    equipment: ["arri skypanel s30", "litepanels gemini 2x1", "astera titan tubes"],
    languages: ["German", "English"], verified: false, rankScore: 65,
    reviewAvg: 4.2, reviewCount: 4, responseHours: 8, lat: 52.520, lng: 13.405,
    availability: [],
    credits: [
      { id: "kw1", project: "Berlinale Doc — Wall Stories", year: 2025, format: "documentary", role: "Gaffer" },
      { id: "kw2", project: "ZDF — Climate Lines", year: 2025, format: "documentary", role: "Gaffer" },
      { id: "kw3", project: "Arte — Europe at Night", year: 2024, format: "documentary", role: "Gaffer" },
    ],
  },

  // ── Sound Mixers (2) ──────────────────────────────────────
  {
    id: "seed_eva_s", slug: "eva-lindqvist", name: "Eva Lindqvist", role: "Sound Mixer",
    city: "Stockholm", country: "SE", dayRateCents: 50000, rateInclEquipment: true,
    equipment: ["sound devices 833", "sennheiser mkh 416", "dpa 4060", "lectrosonics smqv"],
    languages: ["Swedish", "English", "Norwegian"], verified: true, rankScore: 78,
    reviewAvg: 4.6, reviewCount: 12, responseHours: 3, lat: 59.329, lng: 18.068,
    availability: [],
    credits: [
      { id: "el1", project: "SVT — Arctic Lives", year: 2025, format: "documentary", role: "Sound Mixer" },
      { id: "el2", project: "Nordic Noir — Season 4", year: 2025, format: "series", role: "Sound Mixer" },
      { id: "el3", project: "Vasa — The Wreck", year: 2024, format: "documentary", role: "Sound Mixer" },
      { id: "el4", project: "Ikea Family", year: 2024, format: "commercial", role: "Sound Mixer" },
    ],
  },
  {
    id: "seed_diego", slug: "diego-fernandez", name: "Diego Fernández", role: "Sound Mixer",
    city: "Barcelona", country: "ES", dayRateCents: 42000, rateInclEquipment: false,
    equipment: ["zoom f8n pro", "rode ntg3", "sennheiser ew 500"],
    languages: ["Spanish", "Catalan", "English"], verified: false, rankScore: 68,
    reviewAvg: 4.3, reviewCount: 5, responseHours: 7, lat: 41.385, lng: 2.173,
    availability: [],
    credits: [
      { id: "df1", project: "Rosalía — Despechá Live", year: 2025, format: "music_video", role: "Sound Mixer" },
      { id: "df2", project: "C. Tangana — Rooftop", year: 2024, format: "music_video", role: "Sound Mixer" },
      { id: "df3", project: "Estrella Damm — Mediterráneo", year: 2024, format: "commercial", role: "Sound Mixer" },
    ],
  },

  // ── Editors (2) ───────────────────────────────────────────
  {
    id: "seed_mateusz", slug: "mateusz-kowalski", name: "Mateusz Kowalski", role: "Editor",
    city: "Warsaw", country: "PL", dayRateCents: 35000, rateInclEquipment: true,
    equipment: ["davinci resolve studio", "adobe premiere pro", "avid media composer"],
    languages: ["Polish", "English"], verified: false, rankScore: 55,
    reviewAvg: 4.1, reviewCount: 3, responseHours: 10, lat: 52.229, lng: 21.012,
    availability: [],
    credits: [
      { id: "mk1", project: "TVP — Solidarność at 45", year: 2025, format: "documentary", role: "Editor" },
      { id: "mk2", project: "Warsaw Rising — Voices", year: 2024, format: "documentary", role: "Editor" },
      { id: "mk3", project: "Cold Front", year: 2024, format: "feature", role: "Editor" },
    ],
  },
  {
    id: "seed_chiara", slug: "chiara-bianchi", name: "Chiara Bianchi", role: "Editor",
    city: "Rome", country: "IT", dayRateCents: 45000, rateInclEquipment: true,
    equipment: ["adobe premiere pro", "davinci resolve studio", "after effects"],
    languages: ["Italian", "English"], verified: true, rankScore: 72,
    reviewAvg: 4.5, reviewCount: 7, responseHours: 5, lat: 41.902, lng: 12.496,
    availability: [],
    credits: [
      { id: "cb1", project: "Lavazza — A Modo Mio", year: 2025, format: "commercial", role: "Editor" },
      { id: "cb2", project: "Barilla — Family Tables", year: 2025, format: "commercial", role: "Editor" },
      { id: "cb3", project: "Alfa Romeo Tonale", year: 2024, format: "automotive", role: "Editor" },
      { id: "cb4", project: "Campari — Red Diaries", year: 2024, format: "commercial", role: "Editor" },
    ],
  },

  // ── Drone Operators (2) ───────────────────────────────────
  {
    id: "seed_filip", slug: "filip-larsson", name: "Filip Larsson", role: "Drone Operator",
    city: "Oslo", country: "NO", dayRateCents: 55000, rateInclEquipment: true,
    equipment: ["dji inspire 3", "freefly alta x", "dji mavic 3 cine"],
    languages: ["Norwegian", "English", "Swedish"], verified: true, rankScore: 80,
    reviewAvg: 4.7, reviewCount: 10, responseHours: 4, lat: 59.913, lng: 10.752,
    availability: [],
    credits: [
      { id: "fl1", project: "Volvo EX90 — Fjord", year: 2025, format: "automotive", role: "Drone Operator" },
      { id: "fl2", project: "Polestar 4 Launch", year: 2025, format: "automotive", role: "Drone Operator" },
      { id: "fl3", project: "Norway Tourism — Lofoten", year: 2024, format: "commercial", role: "Drone Operator" },
      { id: "fl4", project: "Audi Q8 Winter Test", year: 2024, format: "automotive", role: "Drone Operator" },
    ],
  },
  {
    id: "seed_marija", slug: "marija-petrovic", name: "Marija Petrović", role: "Drone Operator",
    city: "Belgrade", country: "RS", dayRateCents: 40000, rateInclEquipment: true,
    equipment: ["dji mavic 3 cine", "dji inspire 2"],
    languages: ["Serbian", "English"], verified: false, rankScore: 58,
    reviewAvg: 4.0, reviewCount: 4, responseHours: 9, lat: 44.787, lng: 20.457,
    availability: [],
    credits: [
      { id: "mp1", project: "Bajaga — Plavi Safir", year: 2025, format: "music_video", role: "Drone Operator" },
      { id: "mp2", project: "EXIT Festival 2025", year: 2025, format: "music_video", role: "Drone Operator" },
      { id: "mp3", project: "Serbia Untold", year: 2024, format: "documentary", role: "Drone Operator" },
    ],
  },

  // ── Camera Operators (2) ──────────────────────────────────
  {
    id: "seed_hugo", slug: "hugo-van-dijk", name: "Hugo van Dijk", role: "Camera Operator",
    city: "Amsterdam", country: "NL", dayRateCents: 48000, rateInclEquipment: false,
    equipment: ["arri alexa mini", "easyrig vario 5", "movi pro"],
    languages: ["Dutch", "English", "German"], verified: true, rankScore: 70,
    reviewAvg: 4.4, reviewCount: 9, responseHours: 6, lat: 52.367, lng: 4.904,
    availability: [],
    credits: [
      { id: "hv1", project: "Heineken — Cheers To All", year: 2025, format: "commercial", role: "Camera Operator" },
      { id: "hv2", project: "ING — Future Banking", year: 2025, format: "commercial", role: "Camera Operator" },
      { id: "hv3", project: "Philips — Sleep Better", year: 2024, format: "commercial", role: "Camera Operator" },
      { id: "hv4", project: "KLM 105 — Together", year: 2024, format: "commercial", role: "Camera Operator" },
    ],
  },
  {
    id: "seed_andrea", slug: "andrea-schmidt", name: "Andrea Schmidt", role: "Camera Operator",
    city: "Vienna", country: "AT", dayRateCents: 46000, rateInclEquipment: false,
    equipment: ["sony fx9", "ronin rs3 pro", "tilta nucleus-m"],
    languages: ["German", "English"], verified: false, rankScore: 60,
    reviewAvg: 4.2, reviewCount: 5, responseHours: 8, lat: 48.208, lng: 16.373,
    availability: [],
    credits: [
      { id: "as1", project: "ORF — Donau Stories", year: 2025, format: "documentary", role: "Camera Operator" },
      { id: "as2", project: "Vienna Philharmonic — On Tour", year: 2024, format: "documentary", role: "Camera Operator" },
      { id: "as3", project: "Mozart — A Vienna Year", year: 2024, format: "documentary", role: "Camera Operator" },
    ],
  },

  // ── First ADs (2) ─────────────────────────────────────────
  {
    id: "seed_james", slug: "james-oconnor", name: "James O'Connor", role: "1st AD",
    city: "Dublin", country: "IE", dayRateCents: 55000, rateInclEquipment: false,
    equipment: ["movie magic scheduling", "studiobinder"],
    languages: ["English", "Irish"], verified: true, rankScore: 82,
    reviewAvg: 4.8, reviewCount: 13, responseHours: 2, lat: 53.349, lng: -6.260,
    availability: [],
    credits: [
      { id: "jo1", project: "Guinness — Made of More", year: 2025, format: "commercial", role: "1st AD" },
      { id: "jo2", project: "Jameson — Sine Metu", year: 2025, format: "commercial", role: "1st AD" },
      { id: "jo3", project: "Ryanair — Always Getting Better", year: 2024, format: "commercial", role: "1st AD" },
      { id: "jo4", project: "Tourism Ireland — Wild Atlantic", year: 2024, format: "commercial", role: "1st AD" },
    ],
  },
  {
    id: "seed_lucia", slug: "lucia-hernandez", name: "Lucía Hernández", role: "1st AD",
    city: "Madrid", country: "ES", dayRateCents: 52000, rateInclEquipment: false,
    equipment: ["studiobinder", "movie magic"],
    languages: ["Spanish", "English"], verified: true, rankScore: 75,
    reviewAvg: 4.5, reviewCount: 8, responseHours: 5, lat: 40.416, lng: -3.703,
    availability: [],
    credits: [
      { id: "lh1", project: "SEAT Leon Cupra", year: 2025, format: "automotive", role: "1st AD" },
      { id: "lh2", project: "Cupra Tavascan", year: 2025, format: "automotive", role: "1st AD" },
      { id: "lh3", project: "Iberia — Hub Madrid", year: 2024, format: "commercial", role: "1st AD" },
    ],
  },

  // ── Colorist (1) ──────────────────────────────────────────
  {
    id: "seed_niko", slug: "niko-virtanen", name: "Niko Virtanen", role: "Colorist",
    city: "Helsinki", country: "FI", dayRateCents: 80000, rateInclEquipment: true,
    equipment: ["baselight one", "davinci resolve studio", "flanders dm250 hdr monitor"],
    languages: ["Finnish", "English", "Swedish"], verified: true, rankScore: 90,
    reviewAvg: 4.9, reviewCount: 21, responseHours: 3, lat: 60.169, lng: 24.938,
    availability: [],
    credits: [
      { id: "nv1", project: "Nokia — Pure Black", year: 2025, format: "commercial", role: "Colorist" },
      { id: "nv2", project: "Marimekko — Print Stories", year: 2025, format: "commercial", role: "Colorist" },
      { id: "nv3", project: "Kalevala — The Series", year: 2025, format: "series", role: "Colorist" },
      { id: "nv4", project: "Wolt — Late Night", year: 2024, format: "commercial", role: "Colorist" },
      { id: "nv5", project: "Linnanmäki", year: 2024, format: "commercial", role: "Colorist" },
    ],
  },

  // ── Steadicam Operator (1) ────────────────────────────────
  {
    id: "seed_stefan", slug: "stefan-schubert", name: "Stefan Schubert", role: "Steadicam Operator",
    city: "Munich", country: "DE", dayRateCents: 90000, rateInclEquipment: true,
    equipment: ["tiffen steadicam m1", "tilta stabilizer", "easyrig vario 5"],
    languages: ["German", "English"], verified: true, rankScore: 92,
    reviewAvg: 4.8, reviewCount: 18, responseHours: 2, lat: 48.135, lng: 11.582,
    availability: [],
    credits: [
      { id: "ss1", project: "BMW iX — One Take", year: 2026, format: "automotive", role: "Steadicam Op" },
      { id: "ss2", project: "Mercedes EQE — Salon Drive", year: 2025, format: "automotive", role: "Steadicam Op" },
      { id: "ss3", project: "Audi RS6 — Night Run", year: 2025, format: "automotive", role: "Steadicam Op" },
      { id: "ss4", project: "Porsche 911 GT3 RS", year: 2024, format: "automotive", role: "Steadicam Op" },
      { id: "ss5", project: "Adidas Originals — Run It", year: 2024, format: "commercial", role: "Steadicam Op" },
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
