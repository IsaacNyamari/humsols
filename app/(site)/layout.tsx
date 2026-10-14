import { FormCopyProvider } from "@/components/forms/shared";
import { JsonLd } from "@/components/json-ld";
import { AnalyticsConsent } from "@/components/site/analytics-consent";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getPageCopy, getSettings } from "@/lib/data/public";
import type { Metadata } from "next";
import { organizationJsonLd } from "@/lib/seo";

/** Search-engine ownership tags, set in Admin › SEO. */
export async function generateMetadata(): Promise<Metadata> {
  const { verification } = await getSettings();
  return {
    verification: {
      google: verification?.google || undefined,
      other: verification?.bing ? { "msvalidate.01": verification.bing } : undefined,
    },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, global] = await Promise.all([getSettings(), getPageCopy("global")]);
  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <Header />
      <main id="main" className="flex-1">
        <FormCopyProvider successText={global.successText}>{children}</FormCopyProvider>
      </main>
      <Footer />
      <WhatsAppButton />
      <AnalyticsConsent />
    </>
  );
}
