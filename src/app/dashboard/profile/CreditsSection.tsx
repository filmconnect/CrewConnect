"use client";

import { useTransition, useState } from "react";
import { useFormState } from "react-dom";
import { addCredit, removeCredit } from "@/actions/credits";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";
import type { ActionResult } from "@/types";

interface CreditItem {
  id: string;
  year: number;
  projectName: string;
  format: string;
  role: string;
}

interface CreditsSectionProps {
  credits: CreditItem[];
  plan: string;
  defaultRole: string;
}

const FORMATS = [
  "Commercial",
  "Brand Film",
  "Short Film",
  "Feature Film",
  "Documentary",
  "Music Video",
  "Series",
  "Campaign",
  "Launch Film",
  "Tourism Film",
  "Other",
];

const initialState: ActionResult = { success: false };

export default function CreditsSection({
  credits,
  plan,
  defaultRole,
}: CreditsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [addState, addAction] = useFormState(addCredit, initialState);

  const displayedCredits = showAll ? credits : credits.slice(0, 4);

  return (
    <section className="mt-10 mb-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
        CREDITS · {credits.length} PROJECTS
      </p>

      {/* Credit rows */}
      {credits.length === 0 ? (
        <div className="border-2 border-dashed border-[#EEE] rounded-lg p-6 text-center mb-4">
          <p className="text-[14px] text-[#888]">No credits yet</p>
          <p className="text-[12px] text-[#888] mt-1">Add your first credit to build your filmography.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#EEE]">
          {displayedCredits.map((credit) => (
            <CreditRow key={credit.id} credit={credit} />
          ))}
        </div>
      )}

      {/* Show all toggle */}
      {credits.length > 4 && !showAll ? (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 border border-[#EEE] rounded-md px-3 py-1.5 text-[12px] text-[#DBA508] font-medium hover:bg-[#FFFDF5] transition-colors"
        >
          ↓ Show all {credits.length} credits
        </button>
      ) : null}

      {/* Inline add form */}
      <div className="mt-6">
        <h3 className="text-[14px] font-bold mb-3">Add credit</h3>
        <form action={addAction} className="flex flex-wrap items-end gap-3">
          <div className="w-[80px]">
            <Input
              name="year"
              label=""
              type="number"
              placeholder="Year"
              defaultValue={new Date().getFullYear()}
              min={1970}
              max={2100}
              required
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Input
              name="projectName"
              label=""
              placeholder="Project name"
              required
            />
          </div>
          <div className="w-[140px]">
            <select
              name="format"
              required
              className="w-full border border-[#EEE] rounded-md px-3 py-3 text-[14px] text-[#111] bg-white focus:outline-none focus:border-[#111]"
              defaultValue=""
            >
              <option value="" disabled>
                Format
              </option>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[140px]">
            <Input
              name="role"
              label=""
              placeholder="Role"
              defaultValue={defaultRole}
              required
            />
          </div>
          <SubmitButton variant="primary">
            Add credit
          </SubmitButton>
        </form>
        {addState.error ? (
          <p className="text-[13px] text-[#C44B4B] mt-2">{addState.error}</p>
        ) : null}
      </div>
    </section>
  );
}

function CreditRow({ credit }: { credit: CreditItem }) {
  const [isRemoving, startTransition] = useTransition();

  function handleRemove() {
    startTransition(() => {
      void removeCredit(credit.id);
    });
  }

  return (
    <div className="flex items-center py-3 gap-4">
      <span className="text-[14px] text-[#888] w-[50px] shrink-0">{credit.year}</span>
      <span className="text-[14px] font-medium text-[#111] flex-1 min-w-0 truncate">
        {credit.projectName}
      </span>
      <span className="text-[13px] text-[#888] shrink-0">{credit.format}</span>
      <span className="text-[13px] text-[#DBA508] shrink-0">{credit.role}</span>
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="text-[#C44B4B] hover:text-[#a33a3a] text-[14px] shrink-0 ml-2"
        title="Remove credit"
      >
        ×
      </button>
    </div>
  );
}
