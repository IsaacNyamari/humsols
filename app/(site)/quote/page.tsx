import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteWizard } from "@/components/forms/quote-wizard";
import { PageHeader } from "@/components/site/sections";
import { getPageCopy } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Get a quote",
  description:
    "Request a free quote for software, billing systems, websites, CCTV or internet. Priced in KES.",
  path: "/quote",
});

export default async function QuotePage(props: PageProps<"/quote">) {
  const copy = await getPageCopy("quote");
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <section className="py-12 sm:py-16">
        <div className="container-page max-w-3xl">
          <Suspense fallback={<QuoteWizard />}>
            <WizardWithService searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function WizardWithService({
  searchParams,
}: {
  searchParams: PageProps<"/quote">["searchParams"];
}) {
  const { service } = await searchParams;
  return <QuoteWizard initialService={typeof service === "string" ? service : undefined} />;
}
