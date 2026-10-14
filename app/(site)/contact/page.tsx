import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { Icon } from "@/components/icons";
import { PageHeader, Section } from "@/components/site/sections";
import { PlaceholderBadge } from "@/components/ui/card";
import { getPageCopy, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { placeholderText, telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Call +254 725 742 737, WhatsApp or email info@humsols.com. Human Solutions, Westlands, Nairobi.",
  path: "/contact",
});

export default async function ContactPage() {
  const [copy, s] = await Promise.all([getPageCopy("contact"), getSettings()]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <ul className="space-y-4">
              {s.phones.map((p) => (
                <li key={p}>
                  <a
                    href={telHref(p)}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50"
                  >
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon name="phone" />
                    </span>
                    <span>
                      <span className="block text-xs text-muted">Call us</span>
                      <span className="font-semibold">{p}</span>
                    </span>
                  </a>
                </li>
              ))}
              {s.whatsapp ? (
                <li>
                  <a
                    href={whatsappHref(s.whatsapp)}
                    rel="noopener"
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50"
                  >
                    <span className="flex size-11 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366]">
                      <Icon name="whatsapp" />
                    </span>
                    <span>
                      <span className="block text-xs text-muted">WhatsApp</span>
                      <span className="font-semibold">Chat with us</span>
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={`mailto:${s.email}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name="mail" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted">Email</span>
                    <span className="font-semibold">{s.email}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="pin" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Office</span>
                  <span className="font-semibold">{s.address}</span>
                </span>
              </li>
              <li className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="clock" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Opening hours</span>
                  <span className="font-semibold">{s.hours}</span>{" "}
                  {placeholderText(s.hours) ? <PlaceholderBadge /> : null}
                </span>
              </li>
            </ul>
            {s.mapEmbedUrl ? (
              <iframe
                title="Map showing our office in Westlands, Nairobi"
                src={s.mapEmbedUrl}
                className="h-72 w-full rounded-2xl border border-border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </div>
          <div className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-2xl">{copy.formTitle}</h2>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
