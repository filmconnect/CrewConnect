import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatEur } from "@/lib/format";
import logger from "@/lib/logger";
import Navbar from "@/components/layout/Navbar";
import BookingForm from "./BookingForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.crewProfile.findUnique({
    where: { slug },
    select: { name: true, role: true },
  });

  if (!profile) return { title: "Not found — CrewConnect" };

  return {
    title: `Request to book ${profile.name} — CrewConnect`,
    description: `Send a booking request to ${profile.name}, ${profile.role}.`,
  };
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;

  const profile = await prisma.crewProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      role: true,
      city: true,
      country: true,
      dayRate: true,
      rateIncludesEquipment: true,
      avatarUrl: true,
    },
  });

  if (!profile) {
    logger.info({ slug }, "book:profile_not_found");
    notFound();
  }

  logger.info({ slug, crewName: profile.name }, "book:form_loaded");

  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[72px] h-[72px] rounded-lg bg-[#111] flex items-center justify-center text-white text-[22px] font-bold shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            )}
          </div>
          <div>
            <h1 className="text-[24px] font-bold tracking-[-0.5px]">
              Request to book {profile.name}
            </h1>
            <p className="text-[14px] text-[#DBA508] font-medium">{profile.role}</p>
            <p className="text-[13px] text-[#888]">
              {location}
              {profile.dayRate ? (
                <>
                  {" · "}
                  {formatEur(profile.dayRate)}/day
                  {profile.rateIncludesEquipment ? (
                    <span className="text-[#1A8C5E] ml-1">incl. equipment</span>
                  ) : null}
                </>
              ) : null}
            </p>
          </div>
        </div>

        <BookingForm
          profileId={profile.id}
          slug={profile.slug}
          crewName={profile.name}
          defaultRate={profile.dayRate ? profile.dayRate / 100 : undefined}
          crewRole={profile.role}
        />
      </main>
    </div>
  );
}
