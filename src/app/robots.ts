import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://crewconnect.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/crew/"],
        disallow: ["/dashboard/", "/book/", "/api/", "/auth/reset-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
