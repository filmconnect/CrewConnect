import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";
import ProfileForm from "./ProfileForm";
import ClipsSection from "./ClipsSection";
import CreditsSection from "./CreditsSection";

export default async function ProfileEditPage() {
  const { userId } = await requireAuth();

  const profile = await prisma.crewProfile.findUnique({
    where: { userId },
    include: {
      clips: { orderBy: { sortOrder: "asc" } },
      credits: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
    },
  });

  if (!profile) {
    logger.warn({ userId }, "profile_edit:profile_not_found");
    return (
      <div className="py-20 text-center">
        <h1 className="text-h1 mb-2">Profile not found</h1>
        <p className="text-[14px] text-[#888]">Your crew profile is missing.</p>
      </div>
    );
  }

  logger.debug({ userId, clips: profile.clips.length, credits: profile.credits.length, plan: profile.plan }, "profile_edit:loaded");

  return (
    <div className="max-w-3xl">
      <h1 className="text-[24px] font-bold tracking-[-0.5px] mb-8">Your profile</h1>

      {/* Basic info + Links form */}
      <ProfileForm
        profile={{
          name: profile.name,
          role: profile.role,
          city: profile.city ?? "",
          country: profile.country,
          bio: profile.bio ?? "",
          dayRate: profile.dayRate ? profile.dayRate / 100 : undefined,
          rateIncludesEquipment: profile.rateIncludesEquipment,
          equipment: profile.equipment ?? "",
          languages: profile.languages ?? "",
          vimeoUrl: profile.vimeoUrl ?? "",
          youtubeUrl: profile.youtubeUrl ?? "",
          imdbUrl: profile.imdbUrl ?? "",
          websiteUrl: profile.websiteUrl ?? "",
          avatarUrl: profile.avatarUrl ?? "",
        }}
      />

      {/* Clips section */}
      <ClipsSection
        clips={profile.clips.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          url: c.url,
          isFeatured: c.isFeatured,
        }))}
        plan={profile.plan}
      />

      {/* Credits section */}
      <CreditsSection
        credits={profile.credits.map((c) => ({
          id: c.id,
          year: c.year,
          projectName: c.projectName,
          format: c.format,
          role: c.role,
        }))}
        plan={profile.plan}
        defaultRole={profile.role}
      />
    </div>
  );
}
