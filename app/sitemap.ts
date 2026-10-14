import type { MetadataRoute } from "next";
import { getPosts, getProjects, getServices } from "@/lib/data/public";
import { siteUrl } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/services",
  "/products/hs-water-billing",
  "/internet",
  "/cctv",
  "/portfolio",
  "/about",
  "/blog",
  "/careers",
  "/contact",
  "/quote",
  "/support",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getPosts()]);

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt,
      priority: 0.9,
    })),
    ...projects.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.6,
    })),
  ];
}
