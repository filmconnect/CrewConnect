"use client";

import { useState } from "react";
import Link from "next/link";
import ProducerShell from "@/components/producers/ProducerShell";
import MatchCard from "@/components/producers/MatchCard";
import type { MatchResult, MatchRequest } from "@/lib/ai/types";
import { WEIGHTS } from "@/lib/ai/scoring";

interface SearchResponse {
  request: MatchRequest;
  results: MatchResult[];
}

function ParsedChips({ req }: { req: MatchRequest }) {
  const chips: string[] = [];
  if (req.role) chips.push(`Role · ${req.role}`);
  if (req.equipment?.length) chips.push(`Gear · ${req.equipment.join(", ")}`);
  if (req.projectType) chips.push(`Project · ${req.projectType.replace("_", " ")}`);
  if (req.dates) chips.push(`Dates · ${req.dates.start} – ${req.dates.end}`);
  if (req.location?.label) chips.push(`Near · ${req.location.label}`);
  if (req.budgetPerDayCents?.max) chips.push(`Budget · ~€${req.budgetPerDayCents.max / 100}/day`);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <span className="text-[12px] font-semibold text-[#7C5CFC]">✦ Understood</span>
      {chips.map((c, i) => (
        <span key={i} className="text-[12px] px-3 py-1 rounded-full border border-[#DDD] text-[#444]">
          {c}
        </span>
      ))}
    </div>
  );
}

export default function ProducerSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHow, setShowHow] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/producers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
      });

      if (!res.ok) throw new Error("Search failed");

      const json: SearchResponse = await res.json();
      setData(json);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const weightEntries = Object.entries(WEIGHTS) as [string, number][];

  return (
    <ProducerShell mode="producer" active="search">
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <span className="eyebrow-ai">✦ CrewConnect AI</span>
        <h1 className="text-[36px] font-bold tracking-[-1px] mt-3 leading-tight">
          Describe the shoot.
          <br />
          <span
            className="relative inline-block"
            style={{
              background: "linear-gradient(180deg, transparent 55%, #7C5CFC 55%, #7C5CFC 90%, transparent 90%)",
            }}
          >
            <span className="font-black italic">We rank the crew.</span>
          </span>
        </h1>
        <p className="text-[14px] text-[#666] mt-3 max-w-lg">
          Plain language in, the right people out — ranked by availability, gear, credits, rate,
          prior collaborations and reputation.
        </p>

        {/* Search input */}
        <form onSubmit={handleSearch} className="mt-8">
          <div className="ai-search-input">
            <span className="text-[#7C5CFC] text-[16px]">✦</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="DP with own Alexa, automotive experience, available mid-April, ~€700/day near Zagreb"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-ai !py-2.5 !px-6 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search with AI ✦"}
            </button>
          </div>

          {/* Parsed chips */}
          {data?.request && <ParsedChips req={data.request} />}
        </form>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-[#C44B4B] mt-4">{error}</p>
        )}

        {/* Results */}
        {data?.results && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px]">
                <span className="font-bold">{data.results.length} matches</span>
                <span className="text-[#888]"> · ranked by AI match</span>
              </p>
              <button
                onClick={() => setShowHow(!showHow)}
                className="text-[13px] text-[#7C5CFC] font-medium hover:underline"
              >
                {showHow ? "Hide" : "How match works ↓"}
              </button>
            </div>

            {data.results.map((result) => (
              <MatchCard key={result.crew.id} result={result} />
            ))}

            {data.results.length === 0 && (
              <div className="border border-dashed border-[#DDD] rounded-lg p-10 text-center">
                <p className="text-[14px] text-[#888]">No matches found. Try broadening your search.</p>
              </div>
            )}
          </div>
        )}

        {/* How match works */}
        {showHow && (
          <div className="mt-6 p-6 bg-white border border-[#EEE] rounded-lg">
            <p className="text-[14px] text-[#666] mb-4">
              <strong>How the AI match works.</strong> CrewConnect parses your brief into structured criteria,
              then scores every crew profile on a weighted blend of signals. Each score is fully{" "}
              <strong>explainable</strong> — the chips above show exactly why someone ranks where they do.
            </p>
            <div className="weight-chips">
              {weightEntries.map(([key, weight]) => (
                <span key={key} className="weight-chip">
                  <b>{key.charAt(0).toUpperCase() + key.slice(1)}</b> {Math.round(weight * 100)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </ProducerShell>
  );
}
