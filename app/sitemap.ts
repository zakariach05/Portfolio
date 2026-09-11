// app/sitemap.ts
import { MetadataRoute } from "next";
import { COCOON_PAGES } from "@/lib/seo-cocoon";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zakariach05.vercel.app";

  const cocoonUrls: MetadataRoute.Sitemap = Object.values(COCOON_PAGES).map((p) => ({
    url: `${baseUrl}/services/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency as "weekly" | "monthly",
    priority: p.priority,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...cocoonUrls,
    {
      url: `${baseUrl}/projets`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
