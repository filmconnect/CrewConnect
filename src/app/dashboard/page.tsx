import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGreeting } from "@/lib/greeting";
import { startOfMonth, endOfMonth } from "date-fns";
import logger from "@/lib/logger";
import DualLinkBar from "@/components/dashboard/DualLinkBar";
import StatsCards from "@/components/dashboard/StatsCards";
import PendingRequestAlert from "@/components/dashboard/PendingRequestAlert";
import Calendar from "@/components/dashboard/Calendar";
import BookingsList from "@/components/dashboard/BookingsList";
import AddBookingModal from "@/components/dashboard/AddBookingModal";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";

export default async function DashboardPage() {
  const { userId, user } = await requireAuth();

  const profile = await prisma.crewProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
      bookingKey: true,
      name: true,
      _count: { select: { clips: true, credits: true } },
    },
  });

  if (!profile) {
    logger.warn({ userId }, "dashboard:profile_not_found");
    return (
      <div className="py-20 text-center">
        <h1 className="text-h1 mb-2">Profile not found</h1>
        <p className="text-[14px] text-[#888]">
          Your crew profile is missing. Please contact support.
        </p>
      </div>
    );
  }

  // All bookings for this profile
  const bookings = await prisma.booking.findMany({
    where: { profileId: profile.id },
    orderBy: { startDate: "asc" },
  });

  // Blocked dates
  const blockedDates = await prisma.blockedDate.findMany({
    where: { profileId: profile.id },
  });

  // Pending requests
  const pendingRequests = await prisma.bookingRequest.findMany({
    where: {
      profileId: profile.id,
      status: "pending",
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info(
    { userId, bookings: bookings.length, blocked: blockedDates.length, pending: pendingRequests.length },
    "dashboard:loaded"
  );

  // ─── Stats calculation ───────────────────────────────────
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  // Confirmed days total
  const confirmedDays = confirmedBookings.reduce((sum, b) => {
    const days = Math.ceil(
      (b.endDate.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    return sum + days;
  }, 0);

  // Earnings this month: bookings overlapping current month
  const earningsThisMonth = confirmedBookings.reduce((sum, b) => {
    if (b.endDate >= monthStart && b.startDate <= monthEnd && b.dayRate) {
      const days = Math.ceil(
        (b.endDate.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      return sum + b.dayRate * days;
    }
    return sum;
  }, 0);

  // Avg day rate
  const ratedBookings = confirmedBookings.filter((b) => b.dayRate);
  const avgDayRate =
    ratedBookings.length > 0
      ? Math.round(
          ratedBookings.reduce((s, b) => s + (b.dayRate ?? 0), 0) / ratedBookings.length
        )
      : 0;

  const greeting = getGreeting();
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Dual link bar */}
      <DualLinkBar slug={profile.slug} bookingKey={profile.bookingKey} />

      {/* Greeting + Add button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.5px]">
            <span
              className="relative inline-block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
              }}
            >
              <span className="font-black italic">{greeting}</span>
            </span>
            , {firstName}
          </h1>
          <p className="text-[14px] text-[#888] mt-1">
            {confirmedBookings.length} confirmed booking{confirmedBookings.length !== 1 ? "s" : ""}
            {pendingRequests.length > 0
              ? ` · ${pendingRequests.length} pending request${pendingRequests.length !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
        <AddBookingModal />
      </div>

      {/* Stats */}
      <StatsCards
        confirmedDays={confirmedDays}
        pendingCount={pendingRequests.length}
        earningsThisMonth={earningsThisMonth}
        avgDayRate={avgDayRate}
      />

      {/* Pending request alerts */}
      <PendingRequestAlert requests={pendingRequests} />

      {/* Calendar + Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Calendar
            bookings={bookings}
            blockedDates={blockedDates}
            pendingRequests={pendingRequests}
          />
        </div>
        <div className="lg:col-span-2">
          {bookings.length === 0 && pendingRequests.length === 0 ? (
            <div className="space-y-4">
              <div className="border border-[#EEE] rounded-lg p-6 text-center">
                <p className="text-[14px] text-[#888]">Your schedule is empty</p>
                <p className="text-[12px] text-[#888] mt-1">
                  Add bookings or share your booking link to get started.
                </p>
              </div>
              <OnboardingChecklist
                hasClips={profile._count.clips > 0}
                hasCredits={profile._count.credits > 0}
                slug={profile.slug}
                bookingKey={profile.bookingKey}
              />
            </div>
          ) : (
            <BookingsList
              bookings={confirmedBookings.slice(0, 5)}
              pendingRequests={pendingRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
}
