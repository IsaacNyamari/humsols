import type { Metadata } from "next";
import Link from "next/link";
import { CctvSurveyForm } from "@/components/forms/cctv-survey-form";
import { Icon } from "@/components/icons";
import { FaqList, PageHeader, Section } from "@/components/site/sections";
import { ButtonLink } from "@/components/ui/button";
import { getPageCopy, getService } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "CCTV installation — book a free site survey",
  description:
    "CCTV installation in Nairobi: free site survey, IP and analog cameras, NVR/DVR setup, remote viewing on your phone and maintenance.",
  path: "/cctv",
});

export default async function CctvPage() {
  const [copy, service] = await Promise.all([getPageCopy("cctv"), getService("cctv-installation")]);

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        intro={
          service?.summary ?? "Site survey, cameras, recorder setup, phone viewing and maintenance."
        }
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#survey" size="lg">
            Book a free site survey
          </ButtonLink>
          <ButtonLink href="/services/cctv-installation" variant="outline" size="lg">
            How it works
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-2xl">{copy.includedTitle}</h2>
            <ul className="mt-6 space-y-3">
              {(service?.features ?? []).map((f) => (
                <li key={f} className="flex gap-3">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            {service?.process.length ? (
              <ol className="mt-10 space-y-5 border-l-2 border-accent pl-6">
                {service.process.map((p) => (
                  <li key={p.step}>
                    <h3 className="text-base">
                      {p.step}. {p.title}
                    </h3>
                    <p className="text-sm text-muted">{p.text}</p>
                  </li>
                ))}
              </ol>
            ) : null}
            <p className="mt-8 text-sm text-muted">
              Need software or internet too?{" "}
              <Link
                href="/quote?service=cctv-installation"
                className="font-semibold text-primary underline"
              >
                Request a combined quote
              </Link>
              .
            </p>
          </div>
          <div
            id="survey"
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-2xl">{copy.surveyTitle}</h2>
            <p className="mt-2 mb-6 text-sm text-muted">{copy.surveyIntro}</p>
            <CctvSurveyForm />
          </div>
        </div>
      </Section>

      {service?.faqs.length ? (
        <Section eyebrow="FAQ" title="CCTV questions" soft>
          <div className="max-w-3xl">
            <FaqList items={service.faqs} />
          </div>
        </Section>
      ) : null}
    </>
  );
}
