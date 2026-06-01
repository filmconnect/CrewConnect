import Link from "next/link";
import { formatEur, formatDateRange } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import AddExternalBooking from "@/components/dashboard/AddExternalBooking";
import type { BadgeVariant } from "@/types";

interface BookingItem {
  id: string;
  title: string;
  client: string | null;
  startDate: Date;
  endDate: Date;
  dayRate: number | null;
  status: string;
  requestId?: string | null;
}

interface BookingsListProps {
  bookings: BookingItem[];
  pendingRequests: {
    id: string;
    projectName: string;
    producerCompany: string | null;
    role: string | null;
    startDate: Date;
    endDate: Date;
    offeredRate: number;
  }[];
}

function statusToBadge(status: string): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "confirmed":
      return { variant: "confirmed", label: "Confirmed" };
    case "done":
      return { variant: "done", label: "Done" };
    case "cancelled":
      return { variant: "danger", label: "Cancelled" };
    default:
      return { variant: "pending", label: status };
  }
}

export default function BookingsList({ bookings, pendingRequests }: BookingsListProps) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
        BOOKINGS
      </p>

      <div className="space-y-3">
        {/* Confirmed bookings */}
        {bookings.map((b) => {
          const days =
            Math.ceil(
              (b.endDate.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          const badge = statusToBadge(b.status);
          const total = b.dayRate ? b.dayRate * days : null;

          return (
            <div
              key={b.id}
              className="border border-[#1A8C5E]/20 bg-[#F0FAF5] rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[14px] font-bold text-[#1A8C5E]">{b.title}</p>
                  <p className="text-[12px] text-[#1A8C5E]/70">
                    {b.client ? `${b.client} · ` : ""}
                    {formatDateRange(b.startDate, b.endDate)}
                  </p>
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-[#1A8C5E]/70">{days} days</span>
                {total ? (
                  <span className="text-[16px] font-bold text-[#111]">
                    {formatEur(total)}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Pending requests shown as booking cards */}
        {pendingRequests.map((req) => {
          const days =
            Math.ceil(
              (req.endDate.getTime() - req.startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          const total = req.offeredRate * days;

          return (
            <Link key={req.id} href={`/dashboard/request/${req.id}`}>
              <div className="border border-[#DBA508]/30 bg-[#FFFDF5] rounded-lg p-4 hover:border-[#DBA508] transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-[14px] font-bold text-[#111]">{req.projectName}</p>
                    <p className="text-[12px] text-[#888]">
                      {req.producerCompany ? `${req.producerCompany} · ` : ""}
                      {req.role ? `${req.role} · ` : ""}
                      {formatDateRange(req.startDate, req.endDate)}
                    </p>
                  </div>
                  <Badge variant="pending">Pending</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[12px] text-[#888]">{days} days</span>
                  <span className="text-[16px] font-bold text-[#111]">
                    {formatEur(total)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Add external booking CTA */}
        <AddExternalBooking />
      </div>
    </div>
  );
}
