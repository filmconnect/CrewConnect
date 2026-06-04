"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";

export interface CalendarBooking {
  id: string;
  title: string;
  client: string | null;
  startDate: Date;
  endDate: Date;
  dayRate: number | null;
  notes: string | null;
  status: string;
}

interface CalendarBlocked {
  date: Date;
}

interface CalendarRequest {
  id: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

interface CalendarProps {
  bookings: CalendarBooking[];
  blockedDates: CalendarBlocked[];
  pendingRequests: CalendarRequest[];
  onDateClick?: (date: Date, booking: CalendarBooking | null) => void;
}

type DayType = "confirmed" | "blocked" | "pending" | "today" | null;

export default function Calendar({ bookings, blockedDates, pendingRequests, onDateClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Monday as first day of week
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  function getDayType(date: Date): DayType {
    const d = startOfDay(date);

    const isConfirmed = bookings.some(
      (b) =>
        b.status === "confirmed" &&
        isWithinInterval(d, { start: startOfDay(b.startDate), end: startOfDay(b.endDate) })
    );
    if (isConfirmed) return "confirmed";

    const isBlocked = blockedDates.some((bd) => isSameDay(startOfDay(bd.date), d));
    if (isBlocked) return "blocked";

    const isPending = pendingRequests.some(
      (r) =>
        r.status === "pending" &&
        isWithinInterval(d, { start: startOfDay(r.startDate), end: startOfDay(r.endDate) })
    );
    if (isPending) return "pending";

    if (isSameDay(d, today)) return "today";

    return null;
  }

  function getBookingForDate(date: Date): CalendarBooking | null {
    const d = startOfDay(date);
    return bookings.find(
      (b) =>
        b.status === "confirmed" &&
        isWithinInterval(d, { start: startOfDay(b.startDate), end: startOfDay(b.endDate) })
    ) || null;
  }

  function handleDateClick(date: Date, inMonth: boolean) {
    if (!inMonth || !onDateClick) return;
    const booking = getBookingForDate(date);
    onDateClick(date, booking);
  }

  const dayColors: Record<string, string> = {
    confirmed: "bg-[#1A8C5E] text-white",
    blocked: "bg-[#C44B4B] text-white",
    pending: "bg-[#DBA508]/30 text-[#8B6508]",
    today: "font-bold text-[#111]",
  };

  // Build rows
  const rows: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    rows.push(week);
  }

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-h2">{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#FAFAFA] text-[#888]"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#FAFAFA] text-[#888]"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <table className="w-full">
        <thead>
          <tr>
            {weekDays.map((d) => (
              <th key={d} className="text-[12px] text-[#888] font-normal pb-2 text-center w-[14.28%]">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((week, wi) => (
            <tr key={wi}>
              {week.map((d) => {
                const inMonth = isSameMonth(d, currentMonth);
                const type = inMonth ? getDayType(d) : null;

                return (
                  <td key={d.toISOString()} className="text-center py-1.5">
                    <span
                      onClick={() => handleDateClick(d, inMonth)}
                      className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px]
                        ${!inMonth ? "text-[#DDD]" : "cursor-pointer hover:ring-2 hover:ring-[#DBA508]/40"}
                        ${type && dayColors[type] ? dayColors[type] : ""}
                      `}
                    >
                      {format(d, "d")}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        <LegendItem color="bg-[#1A8C5E]" label="Confirmed" />
        <LegendItem color="bg-[#C44B4B]" label="Unavailable" />
        <LegendItem color="bg-[#DBA508]" label="Pending" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-[12px] text-[#888]">{label}</span>
    </div>
  );
}
