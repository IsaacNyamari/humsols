import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { CtaBand, FaqList, PageHeader, ProjectCard, Section } from "@/components/site/sections";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { HS_WATER_BILLING_URL } from "@/lib/constants";
import { getProjects, getService, getSettings } from "@/lib/data/public";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return pageMetadata({
    title: service.seo?.title || service.title,
    description: service.seo?.description || service.summary,
    path: `/services/${service.slug}`,
    image: service.seo?.ogImage || service.heroImage?.url,
  });
}

export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}

async function ServiceContent({ params }: Pick<PageProps<"/services/[slug]">, "params">) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSettings()]);
  if (!service) notFound();
  const projects = await getProjects({ serviceSlug: service.slug, limit: 3 });
  const faq = faqJsonLd(service.faqs);

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      {faq ? <JsonLd data={faq} /> : null}
      <PageHeader eyebrow="Service" title={service.title} intro={service.summary}>
        <div className="flex flex-wrap gap-3">
          {service.slug === "cctv-installation" ? (
            <ButtonLink href="/cctv#survey" size="lg">
              Book a free site survey
            </ButtonLink>
          ) : service.slug === "internet" ? (
            <ButtonLink href="/internet" size="lg">
              See packages & check coverage
            </ButtonLink>
          ) : (
            <ButtonLink href={`/quote?service=${service.slug}`} size="lg">
              Get a quote
            </ButtonLink>
          )}
          {service.slug === "billing-systems" ? (
            <ButtonA href={HS_WATER_BILLING_URL} variant="outline" size="lg" rel="noopener">
              HS Water Billing <Icon name="external" className="size-4" />
            </ButtonA>
          ) : (
            <ButtonLink href="/contact" variant="outline" size="lg">
              Talk to us
            </ButtonLink>
          )}
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {service.heroImage ? (
              <Image
                src={service.heroImage.url}
                alt={service.heroImage.alt}
                width={1200}
                height={675}
                className="mb-8 aspect-video w-full rounded-2xl object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            ) : null}
            <h2 className="mb-4 text-2xl">The problem we solve</h2>
            <Markdown>{service.body}</Markdown>
          </div>
          <aside className="h-fit rounded-2xl border border-border bg-bg-soft p-6">
            <h2 className="text-lg">What&apos;s included</h2>
            <ul className="mt-4 space-y-3">
              {service.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      {service.process.length ? (
        <Section eyebrow="How it works" title="Our process" soft>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((p) => (
              <li key={p.step} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
                  {p.step}
                </span>
                <h3 className="mt-4 text-base">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {projects.length ? (
        <Section eyebrow="Related work" title="Projects">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <Link
            href={`/portfolio?service=${service.slug}`}
            className="mt-6 inline-block font-semibold text-primary hover:underline"
          >
            More {service.title.toLowerCase()} projects →
          </Link>
        </Section>
      ) : null}

      {service.faqs.length ? (
        <Section eyebrow="FAQ" title="Common questions">
          <div className="max-w-3xl">
            <FaqList items={service.faqs} />
          </div>
        </Section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}

function ServiceSkeleton() {
  return (
    <div className="container-page animate-pulse py-20" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-24 rounded bg-bg-soft" />
      <div className="mt-4 h-12 w-2/3 rounded bg-bg-soft" />
      <div className="mt-4 h-5 w-1/2 rounded bg-bg-soft" />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-64 rounded-2xl bg-bg-soft" />
        <div className="h-64 rounded-2xl bg-bg-soft" />
      </div>
    </div>
  );
}
