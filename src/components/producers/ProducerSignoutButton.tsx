"use client";

import { producerSignout } from "@/actions/producers";

export default function ProducerSignoutButton() {
  return (
    <form action={producerSignout}>
      <button
        type="submit"
        className="text-[13px] text-[#888] hover:text-[#111] transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
