"use client";

import { useState } from "react";
import { format } from "date-fns";
import Calendar from "./Calendar";
import type { CalendarBooking } from "./Calendar";
import AddBookingModal from "./AddBookingModal";
import type { BookingData } from "./AddBookingModal";

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

interface CalendarWithBookingProps {
  bookings: CalendarBooking[];
  blockedDates: CalendarBlocked[];
  pendingRequests: CalendarRequest[];
}

export default function CalendarWithBooking({ bookings, blockedDates, pendingRequests }: CalendarWithBookingProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  function handleDateClick(date: Date, booking: CalendarBooking | null) {
    const dateStr = format(date, "yyyy-MM-dd");

    if (booking) {
      setSelectedBooking({
        id: booking.id,
        title: booking.title,
        client: booking.client,
        startDate: format(booking.startDate, "yyyy-MM-dd"),
        endDate: format(booking.endDate, "yyyy-MM-dd"),
        dayRate: booking.dayRate,
        notes: booking.notes,
        status: booking.status,
      });
      setSelectedDate("");
    } else {
      setSelectedBooking(null);
      setSelectedDate(dateStr);
    }
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setSelectedBooking(null);
    setSelectedDate("");
  }

  return (
    <>
      <Calendar
        bookings={bookings}
        blockedDates={blockedDates}
        pendingRequests={pendingRequests}
        onDateClick={handleDateClick}
      />
      <AddBookingModal
        open={modalOpen}
        onClose={handleClose}
        booking={selectedBooking}
        defaultDate={selectedDate}
      />
    </>
  );
}
