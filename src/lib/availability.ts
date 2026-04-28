import { addDays, startOfDay, isWithinInterval, isSameDay } from "date-fns";
import logger from "./logger";

export type DayStatus = "available" | "booked" | "pending";

export interface AvailabilityDay {
  date: Date;
  status: DayStatus;
}

interface BookingLike {
  startDate: Date;
  endDate: Date;
  status: string;
}

interface BlockedDateLike {
  date: Date;
}

export function compute14DayStrip(
  bookings: BookingLike[],
  blockedDates: BlockedDateLike[],
  pendingRequests: BookingLike[]
): AvailabilityDay[] {
  const today = startOfDay(new Date());
  const days: AvailabilityDay[] = [];

  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);

    const isBooked = bookings.some(
      (b) =>
        b.status === "confirmed" &&
        isWithinInterval(date, {
          start: startOfDay(b.startDate),
          end: startOfDay(b.endDate),
        })
    );

    const isBlocked = blockedDates.some((bd) =>
      isSameDay(startOfDay(bd.date), date)
    );

    const isPending = pendingRequests.some(
      (r) =>
        r.status === "pending" &&
        isWithinInterval(date, {
          start: startOfDay(r.startDate),
          end: startOfDay(r.endDate),
        })
    );

    let status: DayStatus = "available";
    if (isBooked || isBlocked) {
      status = "booked";
    } else if (isPending) {
      status = "pending";
    }

    days.push({ date, status });
  }

  const summary = {
    available: days.filter((d) => d.status === "available").length,
    booked: days.filter((d) => d.status === "booked").length,
    pending: days.filter((d) => d.status === "pending").length,
  };
  logger.debug({ summary, bookings: bookings.length, blocked: blockedDates.length, pending: pendingRequests.length }, "availability:computed");

  return days;
}
