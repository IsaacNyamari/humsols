import type { Metadata } from "next";
import { SupportForm } from "@/components/forms/support-form";
import { Icon } from "@/components/icons";
import { PageHeader, Section } from "@/components/site/sections";
import { getPageCopy, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { telHref, whatsappHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("support");
  return pageMetadata({ title: copy.seoTitle, description: copy.seoDescription, path: "/support" });
}

export default async function SupportPage() {
  const [copy, s] = await Promise.all([getPageCopy("support"), getSettings()]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <SupportForm />
          </div>
          <aside className="h-fit space-y-4 rounded-2xl bg-bg-soft p-6">
            <h2 className="text-lg">{copy.urgentTitle}</h2>
            <p className="text-sm text-muted">{copy.urgentText}</p>
            {s.phones.map((p) => (
              <a
                key={p}
                href={telHref(p)}
                className="flex items-center gap-3 font-semibold text-primary"
              >
                <Icon name="phone" className="size-4" /> {p}
              </a>
            ))}
            {s.whatsapp ? (
              <a
                href={whatsappHref(s.whatsapp, "Support request: ")}
                rel="noopener"
                className="flex items-center gap-3 font-semibold text-primary"
              >
                <Icon name="whatsapp" className="size-4" /> WhatsApp support
              </a>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  );
}
