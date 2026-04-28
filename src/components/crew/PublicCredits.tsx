"use client";

import { useState } from "react";

interface Credit {
  id: string;
  year: number;
  projectName: string;
  format: string;
  role: string;
}

interface PublicCreditsProps {
  credits: Credit[];
}

export default function PublicCredits({ credits }: PublicCreditsProps) {
  const [showAll, setShowAll] = useState(false);

  if (credits.length === 0) return null;

  const display = showAll ? credits : credits.slice(0, 4);

  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-4">
        CREDITS · {credits.length} PROJECTS
      </p>

      <div>
        {display.map((credit) => (
          <div
            key={credit.id}
            className="flex items-center py-2.5 border-b border-[#EEE] last:border-0"
          >
            <span className="text-[13px] text-[#888] w-12 shrink-0">
              {credit.year}
            </span>
            <span className="text-[13px] text-[#111] flex-1 min-w-0 truncate ml-4">
              {credit.projectName}
            </span>
            <span className="text-[12px] text-[#888] ml-4">{credit.format}</span>
            <span className="text-[12px] text-[#DBA508] ml-2 font-medium">
              {credit.role}
            </span>
          </div>
        ))}
      </div>

      {credits.length > 4 && !showAll ? (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 border border-[#EEE] rounded-md px-3 py-1.5 text-[12px] text-[#DBA508] font-medium hover:bg-[#FFFDF5] transition-colors"
        >
          ↓ Show all {credits.length} credits
        </button>
      ) : null}
    </section>
  );
}
