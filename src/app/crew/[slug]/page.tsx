import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { compute14DayStrip } from "@/lib/availability";
import { formatEur } from "@/lib/format";
import logger from "@/lib/logger";
import Navbar from "@/components/layout/Navbar";
import VideoCarousel from "@/components/crew/VideoCarousel";
import AvailabilityStrip from "@/components/crew/AvailabilityStrip";
import PublicCredits from "@/components/crew/PublicCredits";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}

async function getProfile(slug: string) {
  return prisma.crewProfile.findUnique({
    where: { slug },
    include: {
      clips: { orderBy: { sortOrder: "asc" } },
      credits: { orderBy: { year: "desc" } },
      bookings: true,
      blockedDates: true,
      bookingRequests: true,
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return { title: "Profile not found — CrewConnect" };
  }

  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return {
    title: `${profile.name} — ${profile.role} | CrewConnect`,
    description: profile.bio || `${profile.name} is a ${profile.role} based in ${location}.`,
    openGraph: {
      title: `${profile.name} — ${profile.role}`,
      description: profile.bio || `${profile.role} based in ${location}`,
      type: "profile",
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
  };
}

export default async function CrewProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { key } = await searchParams;

  const profile = await getProfile(slug);
  if (!profile) {
    logger.info({ slug }, "crew:profile_not_found");
    notFound();
  }

  const isPrivate = key === profile.bookingKey;
  logger.info(
    { slug, mode: isPrivate ? "private" : "public", clips: profile.clips.length, credits: profile.credits.length },
    "crew:profile_viewed"
  );

  // Availability (only for private mode)
  const availability = isPrivate
    ? compute14DayStrip(profile.bookings, profile.blockedDates, profile.bookingRequests)
    : null;

  // Check if currently available (no confirmed booking today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isAvailableToday = !profile.bookings.some(
    (b) =>
      b.status === "confirmed" &&
      new Date(b.startDate) <= today &&
      new Date(b.endDate) >= today
  );

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {/* ─── Header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-[88px] h-[88px] rounded-lg bg-[#111] flex items-center justify-center text-white text-[28px] font-bold shrink-0 overflow-hidden">
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
              <div className="flex items-center gap-3">
                <h1 className="text-[24px] font-bold tracking-[-0.5px]">
                  {profile.name}
                </h1>
                {isAvailableToday ? (
                  <span className="bg-[#F0FAF5] text-[#1A8C5E] text-[11px] font-medium uppercase tracking-[0.5px] px-2.5 py-1 rounded-md border border-[#1A8C5E]/20">
                    Available
                  </span>
                ) : null}
              </div>
              <p className="text-[14px] text-[#DBA508] font-medium mt-0.5">
                {profile.role}
              </p>
              <p className="text-[13px] text-[#888] mt-0.5">
                {location}
                {profile.showDayRate && profile.dayRate ? (
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

          {/* Right side: stats + links */}
          <div className="text-right shrink-0">
            <p className="text-[13px] text-[#888]">
              {profile.credits.length} credits · {profile.clips.length} clips
            </p>
            <div className="flex items-center gap-2 mt-2 justify-end">
              {profile.vimeoUrl ? (
                <ExternalLinkBtn href={profile.vimeoUrl} label="Vimeo" icon="V" />
              ) : null}
              {profile.imdbUrl ? (
                <ExternalLinkBtn href={profile.imdbUrl} label="IMDb" icon="i" />
              ) : null}
              {profile.youtubeUrl ? (
                <ExternalLinkBtn href={profile.youtubeUrl} label="YouTube" icon="▶" />
              ) : null}
              {profile.websiteUrl ? (
                <ExternalLinkBtn href={profile.websiteUrl} label="Website" icon="🌐" />
              ) : null}
            </div>
          </div>
        </div>

        {/* ─── Video Carousel + Sidebar ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <VideoCarousel
              clips={profile.clips.map((c) => ({
                id: c.id,
                title: c.title,
                description: c.description,
                url: c.url,
                isFeatured: c.isFeatured,
              }))}
            />
          </div>

          {/* Sidebar */}
          <div className="border border-[#EEE] rounded-lg bg-white divide-y divide-[#EEE]">
            {/* Details */}
            {profile.showDayRate && profile.dayRate ? (
              <div className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-1">
                  DETAILS
                </p>
                <p className="text-[22px] font-bold">{formatEur(profile.dayRate)}</p>
                <p className="text-[12px] text-[#888]">
                  Day rate
                  {profile.rateIncludesEquipment ? (
                    <span className="text-[#1A8C5E] ml-1">incl. equipment</span>
                  ) : null}
                </p>
              </div>
            ) : null}

            {/* Equipment */}
            {profile.equipment ? (
              <div className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-1">
                  EQUIPMENT
                </p>
                <p className="text-[13px] text-[#111]">
                  {profile.equipment.split("\n").slice(0, 2).join(", ")}
                </p>
              </div>
            ) : null}

            {/* Languages */}
            {profile.languages ? (
              <div className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-1">
                  LANGUAGES
                </p>
                <p className="text-[13px] text-[#111]">{profile.languages}</p>
              </div>
            ) : null}

            {/* Contact / CTA */}
            <div className="p-4">
              {isPrivate ? (
                <Link
                  href={`/book/${profile.slug}`}
                  className="block w-full bg-[#DBA508] text-[#111] font-bold text-center rounded-md py-3 hover:bg-[#c99507] transition-colors"
                >
                  Request to book
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-[#EEE] text-[#AAA] font-medium text-center rounded-md py-3 cursor-not-allowed"
                >
                  Request to book
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Availability (Private only) ────────────────── */}
        {isPrivate && availability ? (
          <div className="mb-10">
            <AvailabilityStrip days={availability} />
          </div>
        ) : null}

        {/* ─── About ──────────────────────────────────────── */}
        {profile.bio ? (
          <section className="mb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
              ABOUT
            </p>
            <p className="text-[14px] text-[#111] leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </section>
        ) : null}

        {/* ─── Credits ────────────────────────────────────── */}
        <div className="mb-10">
          <PublicCredits
            credits={profile.credits.map((c) => ({
              id: c.id,
              year: c.year,
              projectName: c.projectName,
              format: c.format,
              role: c.role,
            }))}
          />
        </div>
      </main>

      {/* ─── Footer CTA (Public only) ──────────────────── */}
      {!isPrivate ? (
        <footer className="bg-[#111] py-16 text-center">
          <h2 className="text-[28px] font-bold text-white tracking-[-0.5px]">
            <span
              className="relative inline-block"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
              }}
            >
              <span className="font-black italic">want to check</span>
            </span>{" "}
            availability
            <br />
            and book {firstName}?
          </h2>
          <p className="text-[14px] text-[#888] mt-4">
            Ask {firstName} for{" "}
            {firstName === profile.name ? "their" : "his"} private booking link.
          </p>
        </footer>
      ) : null}

      {/* ─── Copyright footer ─────────────────────────────── */}
      <div className="border-t border-[#EEE] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-[12px] text-[#888]">
          <p>Crewconnect © {new Date().getFullYear()}. Built in Zagreb by Sekvenca</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#111]">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-[#111]">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-[#111]">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkBtn({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-[#EEE] rounded-md px-3 py-1.5 text-[12px] text-[#888] hover:border-[#111] hover:text-[#111] transition-colors"
      title={label}
    >
      <span className="text-[10px]">{icon}</span>
      {label}
    </a>
  );
}
