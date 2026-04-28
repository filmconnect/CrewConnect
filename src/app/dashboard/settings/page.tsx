import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";
import AccountSection from "./AccountSection";
import BookingLinkSection from "./BookingLinkSection";
import InvoiceSection from "./InvoiceSection";
import ProUpsell from "./ProUpsell";
import DangerZone from "./DangerZone";

export default async function SettingsPage() {
  const { userId, user } = await requireAuth();

  const profile = await prisma.crewProfile.findUnique({
    where: { userId },
    select: {
      slug: true,
      bookingKey: true,
      legalName: true,
      address: true,
      vatNumber: true,
      iban: true,
      paymentTerms: true,
      plan: true,
    },
  });

  if (!profile) {
    logger.warn({ userId }, "settings:profile_not_found");
    return (
      <div className="py-20 text-center">
        <h1 className="text-h1 mb-2">Profile not found</h1>
      </div>
    );
  }

  logger.debug({ userId, plan: profile.plan }, "settings:loaded");

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-bold tracking-[-0.5px] mb-8">Settings</h1>

      <div className="space-y-10">
        <AccountSection email={user.email} />

        <hr className="border-[#EEE]" />

        <BookingLinkSection slug={profile.slug} bookingKey={profile.bookingKey} />

        <hr className="border-[#EEE]" />

        <InvoiceSection
          legalName={profile.legalName ?? ""}
          address={profile.address ?? ""}
          vatNumber={profile.vatNumber ?? ""}
          iban={profile.iban ?? ""}
          paymentTerms={profile.paymentTerms}
        />

        <hr className="border-[#EEE]" />

        {profile.plan === "free" ? <ProUpsell /> : null}

        <DangerZone />
      </div>
    </div>
  );
}
