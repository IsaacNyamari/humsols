import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { Badge, PlaceholderBadge } from "@/components/ui/card";
import { getPageCopy } from "@/lib/data/public";
import type { SiteSettings } from "@/lib/services/settings";
import type { PackageDTO, ProjectDTO, ServiceDTO, TestimonialDTO } from "@/lib/types";
import { cn, formatKes, placeholderText, telHref, whatsappHref } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-aqua/15 blur-3xl"
      />
      <div className="container-page relative py-14 sm:py-20">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="max-w-3xl text-3xl sm:text-5xl">{title}</h1>
        {intro ? <div className="mt-4 max-w-2xl text-lg text-muted">{intro}</div> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  soft,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  soft?: boolean;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", soft && "bg-bg-soft", className)}>
      <div className="container-page">
        {title ? (
          <div className="mb-10 max-w-2xl">
            {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
            <h2 className="text-2xl sm:text-4xl">{title}</h2>
            {intro ? <p className="mt-3 text-muted sm:text-lg">{intro}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function ServiceCard({
  service,
}: {
  service: Pick<ServiceDTO, "slug" | "title" | "summary" | "icon">;
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-fg">
        <Icon name={service.icon} className="size-6" />
      </span>
      <h3 className="text-lg">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.summary}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Learn more{" "}
        <Icon
          name="arrowRight"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

export function ProjectCard({ project }: { project: ProjectDTO }) {
  const cover = project.images[0];
  const isPlaceholder = placeholderText(project.title) || placeholderText(project.client);
  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-royal to-navy">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image
              src="/brand/humsols-mark-dark.png"
              alt=""
              width={72}
              height={72}
              className="opacity-70"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {project.services.map((s) => (
            <Badge key={s.id} tone="primary">
              {s.title}
            </Badge>
          ))}
          {isPlaceholder ? <PlaceholderBadge /> : null}
        </div>
        <h3 className="text-lg group-hover:text-primary">{project.title}</h3>
        <p className="mt-1 text-sm text-muted">{project.client}</p>
        <p className="mt-3 line-clamp-3 text-sm">{project.summary}</p>
      </div>
    </Link>
  );
}

export function PackageCard({ pkg }: { pkg: PackageDTO }) {
  const isPlaceholder = placeholderText(pkg.name) || placeholderText(pkg.fairUse);
  const name = pkg.name.replace(/\s*\[PLACEHOLDER[^\]]*\]/g, "");
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm",
        pkg.popular ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {pkg.popular ? <Badge tone="accent">Most popular</Badge> : null}
        {isPlaceholder ? <PlaceholderBadge /> : null}
      </div>
      <h3 className="text-lg">{name}</h3>
      <p className="mt-3">
        <span className="text-4xl font-extrabold tracking-tight">{pkg.speedMbps}</span>
        <span className="ml-1 font-semibold text-muted">Mbps</span>
      </p>
      <p className="mt-2 text-2xl font-bold">
        {formatKes(pkg.priceKes)}
        <span className="text-sm font-medium text-muted"> / month</span>
      </p>
      <p className="mt-1 text-sm text-muted">
        Installation: {pkg.installationFeeKes ? formatKes(pkg.installationFeeKes) : "Free"}
      </p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
      {pkg.fairUse ? (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted">{pkg.fairUse}</p>
      ) : null}
      <ButtonLink
        href={`/internet?package=${pkg.id}#install`}
        variant={pkg.popular ? "primary" : "outline"}
        className="mt-5 w-full"
      >
        Request installation
      </ButtonLink>
    </div>
  );
}

export function TestimonialCard({ t }: { t: TestimonialDTO }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex text-aqua" aria-label={`${t.rating} out of 5 stars`} role="img">
          {Array.from({ length: t.rating }, (_, i) => (
            <Icon key={i} name="star" className="size-4 fill-current" />
          ))}
        </div>
        {t.isPlaceholder ? <PlaceholderBadge /> : null}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed">“{t.quote}”</blockquote>
      <figcaption className="mt-5 text-sm">
        <span className="block font-semibold">{t.name}</span>
        <span className="text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</span>
      </figcaption>
    </figure>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((f) => (
        <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {f.q}
            <Icon
              name="chevronDown"
              className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {f.a} {placeholderText(f.a) ? <PlaceholderBadge className="ml-1" /> : null}
          </p>
        </details>
      ))}
    </div>
  );
}

/** Call-to-action band. Title/text default to Admin > Page text > Footer & call-to-action band. */
export async function CtaBand({
  settings,
  title,
  text,
}: {
  settings: SiteSettings;
  title?: string;
  text?: string;
}) {
  const global = await getPageCopy("global");
  title ||= global.ctaTitle;
  text ||= global.ctaText;
  return (
    <section className="py-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-white sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -bottom-16 size-64 rounded-full bg-aqua/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/3 size-64 rounded-full bg-royal/40 blur-3xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-xl text-slate-300">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ButtonLink href="/quote" variant="accent" size="lg">
                Get a quote
              </ButtonLink>
              {settings.phones[0] ? (
                <ButtonA href={telHref(settings.phones[0])} variant="light" size="lg">
                  <Icon name="phone" className="size-4" /> Call us
                </ButtonA>
              ) : null}
              {settings.whatsapp ? (
                <ButtonA
                  href={whatsappHref(settings.whatsapp)}
                  variant="light"
                  size="lg"
                  rel="noopener"
                >
                  <Icon name="whatsapp" className="size-4" /> WhatsApp
                </ButtonA>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
