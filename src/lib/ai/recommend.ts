// crewconnect-producers/react/lib/ai/recommend.ts
// -----------------------------------------------------------------------------
// Two recommendation signals shown on a crew profile (producer view):
//   1) coBookedWith  — "Producers who booked X also booked …" (collaborative)
//   2) projectTypeFit — how a crew member's credits map to each project type
// Both are transparent and derived from data already in the system.
// -----------------------------------------------------------------------------

import type { CrewProfile, CoBookedItem, ProjectType, ProjectTypeFit, Credit } from './types';

// Shape of the booking rows this needs (subset of the Booking model).
export interface BookingRow {
  producerId: string;
  crewProfileId: string;
  status: 'CONFIRMED' | string; // only CONFIRMED count toward co-booking
}

// --- 1. Collaborative filtering --------------------------------------------
// Producers who booked `crewId` -> the other crew those producers also booked,
// ranked by how often they co-occur.
//
// In production prefer a single SQL pass. Prisma sketch:
//   const peers = await prisma.booking.findMany({
//     where: { status: 'CONFIRMED', producer: { bookings: {
//       some: { crewProfileId: crewId, status: 'CONFIRMED' } } } },
//     select: { crewProfileId: true },
//   });
//   ...then group + count, exclude crewId, join CrewProfile, normalise.
//
// The array version below is the same logic, handy for the pilot / tests.
export function coBookedWith(
  crewId: string,
  bookings: BookingRow[],
  crewById: Map<string, CrewProfile>,
  limit = 4,
): CoBookedItem[] {
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');
  const producersOfTarget = new Set(
    confirmed.filter((b) => b.crewProfileId === crewId).map((b) => b.producerId),
  );

  const counts = new Map<string, number>();
  for (const b of confirmed) {
    if (b.crewProfileId === crewId) continue;
    if (!producersOfTarget.has(b.producerId)) continue;
    counts.set(b.crewProfileId, (counts.get(b.crewProfileId) ?? 0) + 1);
  }

  const max = Math.max(1, ...Array.from(counts.values()));
  return Array.from(counts.entries())
    .map(([id, togetherCount]) => {
      const c = crewById.get(id);
      if (!c) return null;
      return {
        crew: { id: c.id, slug: c.slug, name: c.name, role: c.role, city: c.city, reviewAvg: c.reviewAvg },
        togetherCount,
        affinity: togetherCount / max,
      } as CoBookedItem;
    })
    .filter((x): x is CoBookedItem => x !== null)
    .sort((a, b) => b.togetherCount - a.togetherCount)
    .slice(0, limit);
}

// --- 2. Project-type fit ----------------------------------------------------
// Pure function over a crew member's credits. Recency-weighted share per type,
// rescaled so the strongest type reads as a high percentage (UI-friendly).
export function projectTypeFit(credits: Credit[], topN = 5): ProjectTypeFit[] {
  if (credits.length === 0) return [];
  const now = new Date().getFullYear();
  const weight = (c: Credit) => 1 / (1 + Math.max(0, now - c.year) * 0.2);

  const byType = new Map<ProjectType, number>();
  let totalW = 0;
  for (const c of credits) {
    const w = weight(c);
    byType.set(c.format, (byType.get(c.format) ?? 0) + w);
    totalW += w;
  }

  const rows = Array.from(byType.entries()).map(([type, w]) => ({ type, raw: w / totalW }));
  const max = Math.max(...rows.map((r) => r.raw));
  // map the leader to ~96% and scale the rest proportionally.
  return rows
    .map((r) => ({ type: r.type, pct: Math.round((r.raw / max) * 96) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, topN);
}
