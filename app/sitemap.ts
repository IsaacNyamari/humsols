import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries();
}
