import { format } from "date-fns";
import type { AvailabilityDay, DayStatus } from "@/lib/availability";

interface AvailabilityStripProps {
  days: AvailabilityDay[];
}

const statusColors: Record<DayStatus, string> = {
  available: "bg-[#1A8C5E] text-white",
  booked: "bg-[#C44B4B] text-white",
  pending: "bg-[#DBA508]/30 text-[#8B6508] border border-[#DBA508]",
};

export default function AvailabilityStrip({ days }: AvailabilityStripProps) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
        AVAILABILITY NEXT 14 DAYS
      </p>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => (
          <div key={day.date.toISOString()} className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-[#888] uppercase">
              {format(day.date, "EEE")}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium ${statusColors[day.status]}`}
            >
              {format(day.date, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <LegendDot color="bg-[#1A8C5E]" label="Available" />
        <LegendDot color="bg-[#C44B4B]" label="Booked" />
        <LegendDot color="bg-[#DBA508]" label="Pending" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[11px] text-[#888]">{label}</span>
    </div>
  );
}
