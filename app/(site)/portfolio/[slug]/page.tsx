import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { CtaBand, PageHeader, Section } from "@/components/site/sections";
import { ButtonA } from "@/components/ui/button";
import { Badge, PlaceholderBadge } from "@/components/ui/card";
import { getProject, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { placeholderText } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/portfolio/${project.slug}`,
    image: project.images[0]?.url,
  });
}

export default function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  return (
    <Suspense
      fallback={<div className="container-page h-96 animate-pulse py-20" aria-busy="true" />}
    >
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: Pick<PageProps<"/portfolio/[slug]">, "params">) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSettings()]);
  if (!project) notFound();
  const isPlaceholder =
    placeholderText(project.title) ||
    placeholderText(project.client) ||
    placeholderText(project.body);

  return (
    <>
      <PageHeader
        eyebrow="Case study"
        title={project.title}
        intro={
          <>
            <span className="block">{project.summary}</span>
            <span className="mt-3 flex flex-wrap items-center gap-2 text-base">
              <span className="font-semibold text-fg">Client:</span> {project.client}
              {isPlaceholder ? <PlaceholderBadge /> : null}
            </span>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {project.services.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`}>
              <Badge tone="primary">{s.title}</Badge>
            </Link>
          ))}
          {project.liveUrl ? (
            <ButtonA
              href={project.liveUrl}
              variant="outline"
              size="sm"
              rel="noopener"
              className="ml-2"
            >
              Visit live site <Icon name="external" className="size-4" />
            </ButtonA>
          ) : null}
        </div>
      </PageHeader>

      {project.results.length ? (
        <section className="border-b border-border">
          <dl className="container-page grid gap-6 py-10 sm:grid-cols-3">
            {project.results.map((r) => (
              <div key={r.label}>
                <dt className="text-sm text-muted">{r.label}</dt>
                <dd className="mt-1 text-3xl font-extrabold text-primary">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Markdown>{project.body}</Markdown>
          {project.images.length ? (
            <div className="space-y-4">
              {project.images.map((img) => (
                <Image
                  key={img.url}
                  src={img.url}
                  alt={img.alt}
                  width={800}
                  height={500}
                  className="w-full rounded-xl border border-border object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              ))}
            </div>
          ) : null}
        </div>
        <Link
          href="/portfolio"
          className="mt-10 inline-block font-semibold text-primary hover:underline"
        >
          ← All projects
        </Link>
      </Section>
      <CtaBand settings={settings} title="Want something similar?" />
    </>
  );
}
