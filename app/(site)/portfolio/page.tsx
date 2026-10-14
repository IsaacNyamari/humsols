import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CtaBand, PageHeader, ProjectCard, Section } from "@/components/site/sections";
import { getPageCopy, getProjects, getServices, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("portfolio");
  return pageMetadata({
    title: copy.seoTitle,
    description: copy.seoDescription,
    path: "/portfolio",
  });
}

export default async function PortfolioPage(props: PageProps<"/portfolio">) {
  const [copy, services, settings] = await Promise.all([
    getPageCopy("portfolio"),
    getServices(),
    getSettings(),
  ]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        <Suspense fallback={<ProjectGridSkeleton />}>
          <FilteredProjects
            searchParams={props.searchParams}
            services={services.map((s) => ({ slug: s.slug, title: s.title }))}
          />
        </Suspense>
      </Section>
      <CtaBand settings={settings} />
    </>
  );
}

async function FilteredProjects({
  searchParams,
  services,
}: {
  searchParams: PageProps<"/portfolio">["searchParams"];
  services: { slug: string; title: string }[];
}) {
  const { service } = await searchParams;
  const active =
    typeof service === "string" && services.some((s) => s.slug === service) ? service : undefined;
  const projects = await getProjects({ serviceSlug: active });

  const chip = (href: string, label: string, on: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={on ? "page" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold",
        on
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-card hover:border-primary/50",
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav aria-label="Filter projects by service" className="mb-8 flex flex-wrap gap-2">
        {chip("/portfolio", "All", !active)}
        {services.map((s) => chip(`/portfolio?service=${s.slug}`, s.title, active === s.slug))}
      </nav>
      {projects.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          No projects in this category yet.
        </p>
      )}
    </>
  );
}

function ProjectGridSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-80 rounded-2xl bg-bg-soft" />
      ))}
    </div>
  );
}
