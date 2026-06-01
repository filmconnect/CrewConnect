"use client";

import AddBookingModal from "./AddBookingModal";

export default function AddExternalBooking() {
  return (
    <AddBookingModal
      trigger={
        <div className="border-2 border-dashed border-[#EEE] rounded-lg p-4 text-center hover:border-[#DBA508] transition-colors cursor-pointer">
          <span className="text-[14px] text-[#DBA508] font-medium">
            + Add external booking
          </span>
        </div>
      }
    />
  );
}
