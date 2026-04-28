import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://crewconnect.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/auth/register`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pro`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Dynamic: all claimed crew profiles
  const profiles = await prisma.crewProfile.findMany({
    where: { claimed: true },
    select: { slug: true, updatedAt: true },
  });

  const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${BASE_URL}/crew/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...profileRoutes];
}
