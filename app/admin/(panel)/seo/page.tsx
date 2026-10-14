import type { Metadata } from "next";
import robots from "@/app/robots";
import { AdminPageTitle } from "@/components/admin/page-title";
import { SeoPanel } from "@/components/admin/seo-panel";
import { requireActor } from "@/lib/auth/session";
import { can } from "@/lib/permissions";
import { siteUrl } from "@/lib/seo";
import { seoReport } from "@/lib/services/seo-report";
import { getSiteSettings } from "@/lib/services/settings";
import { sitemapEntries } from "@/lib/sitemap";

export const metadata: Metadata = { title: "SEO" };

/** Render robots() the way /robots.txt serves it. */
function robotsText() {
  const r = robots();
  const lines: string[] = [];
  for (const rule of [r.rules].flat()) {
    lines.push(`User-Agent: ${[rule.userAgent ?? "*"].flat().join(", ")}`);
    for (const a of [rule.allow ?? []].flat()) lines.push(`Allow: ${a}`);
    for (const d of [rule.disallow ?? []].flat()) lines.push(`Disallow: ${d}`);
    lines.push("");
  }
  if (r.host) lines.push(`Host: ${r.host}`);
  for (const s of [r.sitemap ?? []].flat()) lines.push(`Sitemap: ${s}`);
  return lines.join("\n");
}

export default async function SeoPage() {
  const actor = await requireActor("content:write");
  const [entries, rows, settings] = await Promise.all([
    sitemapEntries(),
    seoReport(),
    getSiteSettings(),
  ]);

  return (
    <>
      <AdminPageTitle
        title="SEO"
        description="Get the site into Google: your sitemap, Search Console steps, verification and a check of every page's title and description."
      />
      <SeoPanel
        siteUrl={siteUrl()}
        sitemapUrls={entries.map((e) => e.url)}
        robotsTxt={robotsText()}
        rows={rows}
        verification={settings.verification ?? { google: "", bing: "" }}
        canEditVerification={can(actor.role, "settings:write")}
      />
    </>
  );
}
