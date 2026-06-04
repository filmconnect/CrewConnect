import Link from "next/link";
import MatchRing from "./MatchRing";
import type { MatchResult, MatchExplanation } from "@/lib/ai/types";

function chipIcon(kind: MatchExplanation["kind"]): string {
  switch (kind) {
    case "ok": return "✓";
    case "warn": return "~";
    case "no": return "✕";
    case "partner": return "✦";
  }
}

function chipClass(kind: MatchExplanation["kind"]): string {
  switch (kind) {
    case "ok": return "chip chip-ok";
    case "warn": return "chip chip-warn";
    case "no": return "chip chip-no";
    case "partner": return "chip chip-partner";
  }
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatRate(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface MatchCardProps {
  result: MatchResult;
}

export default function MatchCard({ result }: MatchCardProps) {
  const { crew, score, explanations } = result;

  return (
    <div className="match-card">
      <div className="flex items-start justify-between gap-4">
        {/* Left: avatar + info */}
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-full bg-[#111] text-white flex items-center justify-center text-[14px] font-bold flex-shrink-0">
            {initials(crew.name)}
            {crew.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#DBA508] rounded-full flex items-center justify-center text-[8px] text-[#111]">
                ✓
              </span>
            )}
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#111]">{crew.name}</p>
            <p className="text-[13px] text-[#DBA508] font-medium">{crew.role}</p>
            <p className="text-[12px] text-[#888] mt-0.5">
              {crew.city}, {crew.country}
              {" · "}
              {formatRate(crew.dayRateCents)}/day
              {" · "}
              <span className="font-semibold">Rank {crew.rankScore}</span>
              {crew.reviewAvg != null && (
                <>
                  {" · "}
                  <span>★ {crew.reviewAvg}</span>
                  <span className="text-[#BBB]"> ({crew.reviewCount})</span>
                </>
              )}
              {crew.reviewAvg == null && crew.reviewCount > 0 && (
                <>
                  {" · "}
                  <span className="text-[#BBB]">★ — ({crew.reviewCount} · needs 3)</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: match ring */}
        <MatchRing score={score} />
      </div>

      {/* Explanation chips */}
      {explanations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {explanations.map((exp, i) => (
            <span key={i} className={chipClass(exp.kind)}>
              {chipIcon(exp.kind)} {exp.text}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <Link
          href={`/crew/${crew.slug}`}
          className="btn-ghost text-[13px] !py-2 !px-4"
          target="_blank"
        >
          View profile
        </Link>
        <Link
          href={`/book/${crew.slug}`}
          className="btn-ai text-[13px] !py-2 flex-1 text-center"
          target="_blank"
        >
          Request to book
        </Link>
      </div>
    </div>
  );
}
