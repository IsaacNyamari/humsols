import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ButtonA, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import {
  CtaBand,
  PackageCard,
  ProjectCard,
  Section,
  ServiceCard,
  TestimonialCard,
} from "@/components/site/sections";
import { HS_WATER_BILLING_URL } from "@/lib/constants";
import {
  getPackages,
  getPageCopy,
  getProjects,
  getServices,
  getSettings,
  getTestimonials,
} from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("home");
  return pageMetadata({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const [copy, settings, services, projects, packages, testimonials] = await Promise.all([
    getPageCopy("home"),
    getSettings(),
    getServices(),
    getProjects({ featured: true, limit: 3 }),
    getPackages(),
    getTestimonials(),
  ]);
  const teaserPackages = [...packages.filter((p) => p.audience === "home")].slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent),radial-gradient(50rem_30rem_at_-10%_10%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]"
        />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="reveal">
            <p className="eyebrow mb-4">{copy.heroEyebrow}</p>
            <h1 className="text-4xl sm:text-6xl">
              {copy.heroTitle} <span className="text-primary">{copy.heroHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{copy.heroIntro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quote" size="lg">
                {copy.heroCta} <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
              {settings.phones[0] ? (
                <ButtonA href={telHref(settings.phones[0])} variant="outline" size="lg">
                  <Icon name="phone" className="size-4" /> {settings.phones[0]}
                </ButtonA>
              ) : null}
            </div>
          </div>

          {/* Product collage, illustrative only (no figures). */}
          <div aria-hidden className="reveal relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="size-3 rounded-full bg-danger/70" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-success/70" />
                <span className="ml-3 h-3 flex-1 rounded-full bg-bg-soft" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["bg-primary/15", "bg-accent/25", "bg-primary/10"].map((c, i) => (
                  <div key={i} className={`h-16 rounded-xl ${c}`} />
                ))}
              </div>
              <div className="mt-4 flex h-28 items-end gap-2 rounded-xl bg-bg-soft p-3">
                {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-primary/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-bg-soft" />
                    <span className="h-2.5 flex-1 rounded-full bg-bg-soft" />
                    <span className="h-2.5 w-12 rounded-full bg-accent/50" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-left-8">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/20 text-fg">
                <Icon name="camera" />
              </span>
              <span className="text-sm font-semibold">{copy.heroChip1}</span>
            </div>
            <div className="absolute -top-5 -right-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-right-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon name="wifi" />
              </span>
              <span className="text-sm font-semibold">{copy.heroChip2}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section
        eyebrow={copy.servicesEyebrow}
        title={copy.servicesTitle}
        intro={copy.servicesIntro}
        soft
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </Section>

      {/* Why */}
      <Section eyebrow={copy.whyEyebrow} title={copy.whyTitle}>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {copy.reasons.map((r) => (
            <div key={r.title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-fg">
                <Icon name={r.icon} />
              </span>
              <div>
                <h3 className="text-base">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* HS Water Billing spotlight */}
      <section className="py-4">
        <div className="container-page">
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-royal to-navy p-8 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <Badge className="border-white/20 bg-white/10 text-white">
                {copy.spotlightBadge}
              </Badge>
              <h2 className="mt-4 text-3xl sm:text-4xl">{copy.spotlightTitle}</h2>
              <p className="mt-4 text-slate-200">{copy.spotlightText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/products/hs-water-billing" variant="accent">
                  See features
                </ButtonLink>
                <ButtonA href={HS_WATER_BILLING_URL} variant="light" rel="noopener">
                  Open HS Water Billing <Icon name="external" className="size-4" />
                </ButtonA>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {copy.spotlightPoints.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
                >
                  <Icon name="check" className="size-4 text-aqua" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects.length ? (
        <Section eyebrow={copy.projectsEyebrow} title={copy.projectsTitle}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <Link
            href="/portfolio"
            className="mt-8 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            View all projects <Icon name="arrowRight" className="size-4" />
          </Link>
        </Section>
      ) : null}

      {/* Internet teaser */}
      {teaserPackages.length ? (
        <Section
          eyebrow={copy.internetEyebrow}
          title={copy.internetTitle}
          intro={copy.internetIntro}
          soft
        >
          <div className="grid gap-5 md:grid-cols-3">
            {teaserPackages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
          <Link
            href="/internet"
            className="mt-8 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            All packages & coverage check <Icon name="arrowRight" className="size-4" />
          </Link>
        </Section>
      ) : null}

      {/* Testimonials */}
      {testimonials.length ? (
        <Section eyebrow={copy.testimonialsEyebrow} title={copy.testimonialsTitle}>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}
