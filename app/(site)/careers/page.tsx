import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { PageHeader, Section } from "@/components/site/sections";
import { ButtonA } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { getJobs, getPageCopy, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: "Open roles at Human Solutions in Nairobi.",
  path: "/careers",
});

export default async function CareersPage() {
  const [copy, jobs, settings] = await Promise.all([
    getPageCopy("careers"),
    getJobs(),
    getSettings(),
  ]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        {jobs.length ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <article
                key={job.id}
                id={job.slug}
                className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">{job.type}</Badge>
                  <Badge>{job.location}</Badge>
                </div>
                <h2 className="mt-3 text-2xl">{job.title}</h2>
                <Markdown className="mt-4">{job.description}</Markdown>
                <ButtonA
                  href={`mailto:${settings.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                  className="mt-6"
                >
                  <Icon name="mail" className="size-4" /> Apply by email
                </ButtonA>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Icon name="briefcase" className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-xl">{copy.emptyTitle}</h2>
            <p className="mt-2 text-muted">
              {copy.emptyText}{" "}
              <a href={`mailto:${settings.email}`} className="font-semibold text-primary underline">
                {settings.email}
              </a>
              .
            </p>
          </div>
        )}
      </Section>
    </>
  );
}
