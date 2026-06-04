// crewconnect-producers/react/lib/types.ts
// -----------------------------------------------------------------------------
// Domain types for the CrewConnect Producers area + AI matching engine.
// These mirror the existing crew-side Prisma models and add the producer side.
// Money is always handled in integer cents to avoid float drift (same as the
// existing booking flow, e.g. CC-2026-00002 stored 65000 = €650.00).
// -----------------------------------------------------------------------------

export type CrewRole = string; // free text, e.g. "Director of Photography", "Gaffer"

export type ProjectType =
  | 'automotive'
  | 'lifestyle'
  | 'commercial'
  | 'documentary'
  | 'music_video'
  | 'series'
  | 'feature'
  | 'other';

export type AvailabilityStatus = 'available' | 'booked' | 'pending';

export interface AvailabilityDay {
  date: string;            // ISO yyyy-mm-dd
  status: AvailabilityStatus;
}

export interface Credit {
  id: string;
  project: string;
  year: number;
  format: ProjectType;
  role: CrewRole;
}

// Read model the matching engine consumes. Built from CrewProfile + relations.
export interface CrewProfile {
  id: string;
  slug: string;                 // /crew/{slug}
  name: string;
  role: CrewRole;
  city: string;
  country: string;
  dayRateCents: number;
  rateInclEquipment: boolean;
  equipment: string[];          // normalised gear tokens, e.g. "arri alexa mini lf"
  languages: string[];
  verified: boolean;
  rankScore: number;            // CC Rank, 0..100 (recomputed weekly, crew-side)
  reviewAvg: number | null;     // null until reviewCount >= 3
  reviewCount: number;
  responseHours: number | null; // avg response time to requests
  lat: number;
  lng: number;
  availability: AvailabilityDay[];
  credits: Credit[];
}

// Output of parsing a producer's free-text brief (LLM step). Everything optional:
// the engine treats a missing constraint as "no preference" (neutral score).
export interface MatchRequest {
  role?: CrewRole;
  dates?: { start: string; end: string };  // ISO
  equipment?: string[];                      // required gear tokens
  projectType?: ProjectType;
  location?: { lat: number; lng: number; label?: string };
  maxKm?: number;                            // search radius, default in engine
  budgetPerDayCents?: { min?: number; max?: number };
}

// Extra context the engine needs but that is not part of the brief itself.
export interface MatchContext {
  producerId?: string;
  // Project names the producer's partners have worked on. Used to compute the
  // "worked with your partners" signal. Resolved from Collaboration data.
  partnerProjects?: string[];
}

export interface MatchFactor {
  key:
    | 'availability'
    | 'role'
    | 'equipment'
    | 'credits'
    | 'location'
    | 'collaboration'
    | 'rate';
  weight: number;  // 0..1, see WEIGHTS in scoring.ts
  score: number;   // 0..1
}

export interface MatchExplanation {
  kind: 'ok' | 'warn' | 'no' | 'partner';
  text: string;    // e.g. "Owns ARRI Alexa Mini LF"
}

export interface MatchResult {
  crew: CrewProfile;
  score: number;                 // 0..100, rounded
  factors: MatchFactor[];
  explanations: MatchExplanation[];
}

// Collaborative-filtering recommendation ("also booked").
export interface CoBookedItem {
  crew: Pick<CrewProfile, 'id' | 'slug' | 'name' | 'role' | 'city' | 'reviewAvg'>;
  togetherCount: number;         // shared bookings
  affinity: number;              // 0..1 normalised
}

export interface ProjectTypeFit {
  type: ProjectType;
  pct: number;                   // 0..100
}

// Producer account + access lifecycle (new models, see TECHNICAL_SPEC.md).
export type ProducerStatus = 'REQUESTED' | 'INVITED' | 'APPROVED' | 'REJECTED';

export interface Producer {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;                  // Producer, Line Producer, ...
  website?: string;
  produces: ProjectType[];       // what they produce
  status: ProducerStatus;
  invitedById?: string;          // admin/crew who invited, if invite path
  createdAt: string;
}
