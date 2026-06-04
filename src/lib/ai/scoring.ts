// crewconnect-producers/react/lib/ai/scoring.ts
// -----------------------------------------------------------------------------
// Deterministic, EXPLAINABLE match scoring. This is the core of the "AI match".
//
// Why deterministic? For a TRL 3-4 proof of concept and an IP filing, an
// explainable weighted model is far stronger than a black box: every score can
// be decomposed into the factors below, and every result card shows *why*.
// The LLM (see parse.ts) is used only to turn a free-text brief into the
// structured MatchRequest; it never decides the ranking.
//
// Weights match the architecture agreed in design. Tune them centrally here.
// -----------------------------------------------------------------------------

import type {
  CrewProfile,
  MatchRequest,
  MatchContext,
  MatchFactor,
  MatchExplanation,
  MatchResult,
} from './types';

export const WEIGHTS = {
  availability: 0.30,
  role: 0.20,
  equipment: 0.15,
  credits: 0.15,
  location: 0.10,
  collaboration: 0.05,
  rate: 0.05,
} as const;

const DEFAULT_RADIUS_KM = 75;

// ---- helpers ---------------------------------------------------------------

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function daysInRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// ---- individual factor scorers (each returns 0..1) -------------------------

function scoreAvailability(crew: CrewProfile, req: MatchRequest) {
  if (!req.dates) return { score: 1, free: 0, total: 0 }; // no date constraint -> neutral
  const wanted = daysInRange(req.dates.start, req.dates.end);
  const map = new Map(crew.availability.map((a) => [a.date, a.status]));
  let free = 0;
  for (const day of wanted) if ((map.get(day) ?? 'available') === 'available') free++;
  return { score: wanted.length ? free / wanted.length : 1, free, total: wanted.length };
}

function scoreRole(crew: CrewProfile, req: MatchRequest) {
  if (!req.role) return 1;
  const a = norm(crew.role);
  const b = norm(req.role);
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.6;
  return 0;
}

function scoreEquipment(crew: CrewProfile, req: MatchRequest) {
  const required = (req.equipment ?? []).map(norm);
  if (required.length === 0) return { score: 1, matched: [] as string[], missing: [] as string[] };
  const owned = crew.equipment.map(norm);
  const matched = required.filter((r) => owned.some((o) => o.includes(r) || r.includes(o)));
  const missing = required.filter((r) => !matched.includes(r));
  return { score: matched.length / required.length, matched, missing };
}

function scoreCredits(crew: CrewProfile, req: MatchRequest) {
  if (!req.projectType) return { score: 1, count: 0 };
  const now = new Date().getFullYear();
  const relevant = crew.credits.filter((c) => c.format === req.projectType);
  // recency-weighted count, capped: recent credits count more.
  let weighted = 0;
  for (const c of relevant) {
    const age = Math.max(0, now - c.year);
    weighted += 1 / (1 + age * 0.25); // this year=1.0, 4y ago≈0.5
  }
  // saturate: ~6 weighted credits -> full marks.
  return { score: Math.min(1, weighted / 6), count: relevant.length };
}

function scoreLocation(crew: CrewProfile, req: MatchRequest) {
  if (!req.location) return { score: 1, km: 0 };
  const km = haversineKm(req.location, { lat: crew.lat, lng: crew.lng });
  const radius = req.maxKm ?? DEFAULT_RADIUS_KM;
  if (km <= radius) return { score: 1, km };
  // linear decay over the next 2x radius, floor 0.
  const score = Math.max(0, 1 - (km - radius) / (radius * 2));
  return { score, km };
}

function scoreCollaboration(crew: CrewProfile, ctx: MatchContext) {
  const partner = (ctx.partnerProjects ?? []).map(norm);
  if (partner.length === 0) return { score: 0, overlapWith: null as string | null };
  const hit = crew.credits.find((c) => partner.includes(norm(c.project)));
  return { score: hit ? 1 : 0, overlapWith: hit ? hit.project : null };
}

function scoreRate(crew: CrewProfile, req: MatchRequest) {
  const max = req.budgetPerDayCents?.max;
  if (!max) return 1;
  if (crew.dayRateCents <= max) return 1;
  // soft penalty for going over budget, floor 0 at +50%.
  const over = (crew.dayRateCents - max) / max;
  return Math.max(0, 1 - over * 2);
}

// ---- main entry: score one crew member -------------------------------------

export function scoreCrew(
  crew: CrewProfile,
  req: MatchRequest,
  ctx: MatchContext = {},
): MatchResult {
  const av = scoreAvailability(crew, req);
  const role = scoreRole(crew, req);
  const eq = scoreEquipment(crew, req);
  const cr = scoreCredits(crew, req);
  const loc = scoreLocation(crew, req);
  const collab = scoreCollaboration(crew, ctx);
  const rate = scoreRate(crew, req);

  const factors: MatchFactor[] = [
    { key: 'availability', weight: WEIGHTS.availability, score: av.score },
    { key: 'role', weight: WEIGHTS.role, score: role },
    { key: 'equipment', weight: WEIGHTS.equipment, score: eq.score },
    { key: 'credits', weight: WEIGHTS.credits, score: cr.score },
    { key: 'location', weight: WEIGHTS.location, score: loc.score },
    { key: 'collaboration', weight: WEIGHTS.collaboration, score: collab.score },
    { key: 'rate', weight: WEIGHTS.rate, score: rate },
  ];

  const total = factors.reduce((s, f) => s + f.weight * f.score, 0);
  const score = Math.round(total * 100);

  const explanations = explain({ crew, req, ctx, av, eq, cr, loc, collab, rate });
  return { crew, score, factors, explanations };
}

// ---- derive human-readable chips from the factor results -------------------

function explain(p: {
  crew: CrewProfile;
  req: MatchRequest;
  ctx: MatchContext;
  av: ReturnType<typeof scoreAvailability>;
  eq: ReturnType<typeof scoreEquipment>;
  cr: ReturnType<typeof scoreCredits>;
  loc: ReturnType<typeof scoreLocation>;
  collab: ReturnType<typeof scoreCollaboration>;
  rate: number;
}): MatchExplanation[] {
  const out: MatchExplanation[] = [];

  // availability
  if (p.req.dates) {
    if (p.av.score === 1) out.push({ kind: 'ok', text: `Available all ${p.av.total} days` });
    else if (p.av.score > 0) out.push({ kind: 'warn', text: `Available ${p.av.free} of ${p.av.total} days` });
    else out.push({ kind: 'no', text: 'Not available on those dates' });
  }

  // equipment
  if ((p.req.equipment ?? []).length) {
    if (p.eq.missing.length === 0) out.push({ kind: 'ok', text: `Owns ${p.eq.matched.join(', ')}` });
    else if (p.eq.matched.length) out.push({ kind: 'warn', text: `Owns ${p.eq.matched.join(', ')}; missing ${p.eq.missing.join(', ')}` });
    else out.push({ kind: 'no', text: `No ${p.req.equipment!.join(', ')} (rents)` });
  }

  // credits
  if (p.req.projectType) {
    const t = p.req.projectType.replace('_', ' ');
    if (p.cr.count >= 5) out.push({ kind: 'ok', text: `${p.cr.count} ${t} credits` });
    else if (p.cr.count > 0) out.push({ kind: 'warn', text: `${p.cr.count} ${t} credits` });
    else out.push({ kind: 'no', text: `No ${t} credits` });
  }

  // collaboration (partner overlap) — the headline grant signal
  if (p.collab.overlapWith) {
    out.push({ kind: 'partner', text: `Worked with your partner on ${p.collab.overlapWith}` });
  }

  // location
  if (p.req.location && p.loc.km > (p.req.maxKm ?? DEFAULT_RADIUS_KM)) {
    out.push({ kind: 'warn', text: `${Math.round(p.loc.km)} km away` });
  }

  // rate
  if (p.req.budgetPerDayCents?.max && p.rate < 1) {
    out.push({ kind: 'warn', text: 'Above your budget' });
  }

  return out;
}

// ---- orchestration: rank a candidate set -----------------------------------
// Sorting matches CC Rank policy: verified crew sort first within equal scores.

export function runSearch(
  candidates: CrewProfile[],
  req: MatchRequest,
  ctx: MatchContext = {},
): MatchResult[] {
  return candidates
    .map((c) => scoreCrew(c, req, ctx))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.crew.verified !== b.crew.verified) return a.crew.verified ? -1 : 1;
      return b.crew.rankScore - a.crew.rankScore;
    });
}
