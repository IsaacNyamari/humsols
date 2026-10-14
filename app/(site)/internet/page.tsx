import type { Metadata } from "next";
import { Suspense } from "react";
import { CoverageForm, InstallationForm } from "@/components/forms/internet-forms";
import { FaqList, PackageCard, PageHeader, Section } from "@/components/site/sections";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { getFaqs, getPackages, getPageCopy } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import type { PackageDTO } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("internet");
  return pageMetadata({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/internet",
  });
}

function PackageGrid({ packages }: { packages: PackageDTO[] }) {
  if (!packages.length)
    return (
      <p className="text-muted">No packages listed right now — contact us for current options.</p>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((p) => (
        <PackageCard key={p.id} pkg={p} />
      ))}
    </div>
  );
}

export default async function InternetPage(props: PageProps<"/internet">) {
  const [copy, packages, faqs] = await Promise.all([
    getPageCopy("internet"),
    getPackages(),
    getFaqs("internet"),
  ]);
  const home = packages.filter((p) => p.audience === "home");
  const business = packages.filter((p) => p.audience === "business");

  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#coverage" size="lg">
            Check coverage
          </ButtonLink>
          <ButtonLink href="#install" variant="outline" size="lg">
            Request installation
          </ButtonLink>
        </div>
      </PageHeader>

      <Section eyebrow="Packages" title={copy.packagesTitle} intro={copy.packagesIntro}>
        <Tabs
          tabs={[
            { label: `Home (${home.length})`, content: <PackageGrid packages={home} /> },
            {
              label: `Business (${business.length})`,
              content: <PackageGrid packages={business} />,
            },
          ]}
        />
      </Section>

      <Section
        id="coverage"
        eyebrow="Coverage"
        title={copy.coverageTitle}
        intro={copy.coverageIntro}
        soft
      >
        <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <CoverageForm />
        </div>
      </Section>

      <Section id="install" eyebrow="Installation" title={copy.installTitle}>
        <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Suspense fallback={<InstallationForm packages={packages} />}>
            <InstallationWithPreselect packages={packages} searchParams={props.searchParams} />
          </Suspense>
        </div>
      </Section>

      {faqs.length ? (
        <Section eyebrow="FAQ" title={copy.faqTitle} soft>
          <div className="max-w-3xl">
            <FaqList items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
          </div>
        </Section>
      ) : null}
    </>
  );
}

async function InstallationWithPreselect({
  packages,
  searchParams,
}: {
  packages: PackageDTO[];
  searchParams: PageProps<"/internet">["searchParams"];
}) {
  const { package: pkg } = await searchParams;
  return (
    <InstallationForm
      packages={packages}
      initialPackageId={typeof pkg === "string" ? pkg : undefined}
    />
  );
}
