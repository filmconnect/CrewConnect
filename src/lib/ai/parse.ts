// crewconnect-producers/react/lib/ai/parse.ts
// -----------------------------------------------------------------------------
// Turns a producer's free-text brief into a structured MatchRequest.
// This is the one place an LLM is used. It does NOT rank — it only extracts
// constraints, which the deterministic engine (scoring.ts) then scores.
//
// Runs server-side only (needs ANTHROPIC_API_KEY). Never expose the key to the
// client — call this from the API route, not from a component.
// -----------------------------------------------------------------------------

import type { MatchRequest, ProjectType } from './types';

const MODEL = 'claude-sonnet-4-20250514'; // pick the current model string at build time
const PROJECT_TYPES: ProjectType[] = [
  'automotive', 'lifestyle', 'commercial', 'documentary',
  'music_video', 'series', 'feature', 'other',
];

const SYSTEM = `You convert a film producer's plain-language crew brief into JSON.
Return ONLY a JSON object, no prose, matching this shape (omit unknown fields):
{
  "role": string,                       // e.g. "Director of Photography", "Gaffer"
  "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "equipment": string[],                // gear they must own, lowercase, e.g. ["arri alexa"]
  "projectType": one of ${JSON.stringify(PROJECT_TYPES)},
  "maxKm": number,                      // search radius if a place is named
  "budgetPerDayCents": { "min": number, "max": number }  // euros * 100
}
Resolve relative dates against the current date. If a city is named, set its lat/lng under "location".`;

interface ParseOptions {
  today?: string;       // ISO date to resolve "mid-April" etc., defaults to now
  geocode?: (place: string) => Promise<{ lat: number; lng: number } | null>;
}

export async function parseBrief(text: string, opts: ParseOptions = {}): Promise<MatchRequest> {
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: `${SYSTEM}\nToday is ${today}.`,
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const raw = (data.content ?? [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .replace(/```json|```/g, '')
      .trim();
    const parsed = JSON.parse(raw) as MatchRequest & { location?: { label?: string } };
    return parsed;
  } catch (err) {
    // Graceful degradation: a tiny keyword parser keeps search usable if the
    // LLM is unavailable. The engine handles missing fields as "no preference".
    console.error('parseBrief: falling back to keywords —', err);
    return keywordParse(text);
  }
}

// ---- minimal deterministic fallback ----------------------------------------

const ROLE_HINTS: Record<string, string> = {
  dp: 'Director of Photography',
  'director of photography': 'Director of Photography',
  gaffer: 'Gaffer',
  sound: 'Sound Recordist',
  editor: 'Editor',
  colourist: 'Colourist',
  colorist: 'Colourist',
};

function keywordParse(text: string): MatchRequest {
  const t = text.toLowerCase();
  const req: MatchRequest = {};

  for (const [k, v] of Object.entries(ROLE_HINTS)) {
    if (t.includes(k)) { req.role = v; break; }
  }
  for (const pt of PROJECT_TYPES) {
    if (t.includes(pt.replace('_', ' '))) { req.projectType = pt; break; }
  }
  const gear = ['arri alexa', 'red', 'sony venice', 'ronin', 'zeiss', 'cooke'];
  const eq = gear.filter((g) => t.includes(g));
  if (eq.length) req.equipment = eq;

  const budget = t.match(/(?:€|eur\s?)(\d{2,5})/);
  if (budget) req.budgetPerDayCents = { max: parseInt(budget[1], 10) * 100 };

  return req;
}
