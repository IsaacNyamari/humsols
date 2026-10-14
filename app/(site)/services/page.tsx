import type { Metadata } from "next";
import { CtaBand, PageHeader, Section, ServiceCard } from "@/components/site/sections";
import { getPageCopy, getServices, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Web applications, custom software, billing systems, websites, CCTV installation and internet — from one Nairobi team.",
  path: "/services",
});

export default async function ServicesPage() {
  const [copy, services, settings] = await Promise.all([
    getPageCopy("services"),
    getServices(),
    getSettings(),
  ]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>
      <CtaBand settings={settings} title={copy.ctaTitle} text={copy.ctaText} />
    </>
  );
}
