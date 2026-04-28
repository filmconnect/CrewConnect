"use client";

import { useTransition, useState } from "react";
import { regenerateBookingKey } from "@/actions/crew";
import CopyButton from "@/components/dashboard/CopyButton";

interface BookingLinkSectionProps {
  slug: string;
  bookingKey: string;
}

export default function BookingLinkSection({ slug, bookingKey: initialKey }: BookingLinkSectionProps) {
  const [key, setKey] = useState(initialKey);
  const [isPending, startTransition] = useTransition();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const fullUrl = `${baseUrl}/crew/${slug}?key=${key}`;

  function handleRegenerate() {
    if (!confirm("This will invalidate the current link. Anyone using the old link will only see your public portfolio. Continue?")) {
      return;
    }
    startTransition(async () => {
      const result = await regenerateBookingKey();
      if (result.success && result.data) {
        setKey(result.data);
      }
    });
  }

  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-2">
        BOOKING LINK
      </p>
      <div className="bg-[#FFF8E1] border border-[#F5E6A3] rounded-md px-4 py-3 flex items-center justify-between mb-2">
        <p className="text-[13px] text-[#111] truncate">
          crewconnect.com/crew/{slug}?key=<span className="font-bold">{key}</span>
        </p>
        <CopyButton text={fullUrl} />
      </div>
      <p className="text-[13px] text-[#888] mb-3">
        Only people with this link can see your availability and request to book you.
      </p>
      <button
        onClick={handleRegenerate}
        disabled={isPending}
        className="text-[14px] font-bold text-[#C44B4B] hover:text-[#a33a3a] transition-colors disabled:opacity-50"
      >
        {isPending ? "Regenerating..." : "Regenerate key"}
      </button>
      <p className="text-[12px] text-[#888] mt-1">
        This will invalidate the current link. Anyone using the old link will only see your public portfolio.
      </p>
    </section>
  );
}
