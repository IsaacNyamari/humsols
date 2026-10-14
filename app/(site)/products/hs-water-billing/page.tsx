import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { CtaBand, PageHeader, Section } from "@/components/site/sections";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { PlaceholderBadge } from "@/components/ui/card";
import { HS_WATER_BILLING_REQUEST_ACCESS_URL, HS_WATER_BILLING_URL } from "@/lib/constants";
import { getPageCopy, getSettings } from "@/lib/data/public";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { placeholderText } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "HS Water Billing — water billing & borehole project management",
  description:
    "HS Water Billing is a multi-tenant platform for water billing and borehole project management. Built by Human Solutions.",
  path: "/products/hs-water-billing",
});

const stripPlaceholder = (s: string) => s.replace(/\s*\[PLACEHOLDER[^\]]*\]/g, "");

export default async function HsWaterBillingPage() {
  const [copy, settings] = await Promise.all([getPageCopy("hsWaterBilling"), getSettings()]);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "HS Water Billing",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: HS_WATER_BILLING_URL,
          publisher: { "@id": `${siteUrl()}/#organization` },
        }}
      />
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
        <div className="flex flex-wrap gap-3">
          <ButtonA href={HS_WATER_BILLING_REQUEST_ACCESS_URL} size="lg" rel="noopener">
            Request access <Icon name="external" className="size-4" />
          </ButtonA>
          <ButtonA href={HS_WATER_BILLING_URL} variant="outline" size="lg" rel="noopener">
            Sign in to HS Water Billing
          </ButtonA>
        </div>
      </PageHeader>

      <Section eyebrow={copy.featuresEyebrow} title={copy.featuresTitle}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-4 flex flex-wrap items-center gap-2 text-base">
                {stripPlaceholder(f.title)}{" "}
                {placeholderText(f.title) || placeholderText(f.text) ? <PlaceholderBadge /> : null}
              </h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow={copy.audienceEyebrow} title={copy.audienceTitle} soft>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.audiences.map((a) => (
            <li
              key={a}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 font-semibold"
            >
              <Icon name="check" className="size-5 text-success" /> {a}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/quote?service=billing-systems">
            Need a different billing system?
          </ButtonLink>
          <ButtonLink href="/services/billing-systems" variant="outline">
            Billing & management systems
          </ButtonLink>
        </div>
      </Section>

      <CtaBand settings={settings} title={copy.ctaTitle} text={copy.ctaText} />
    </>
  );
}
