import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { CtaBand, PageHeader, Section } from "@/components/site/sections";
import { PlaceholderBadge } from "@/components/ui/card";
import { getPageCopy, getSettings, getTeam } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { placeholderText } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("about");
  return pageMetadata({ title: copy.seoTitle, description: copy.seoDescription, path: "/about" });
}

export default async function AboutPage() {
  const [copy, team, settings] = await Promise.all([
    getPageCopy("about"),
    getTeam(),
    getSettings(),
  ]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="flex flex-wrap items-center gap-2 text-2xl">
              {copy.storyTitle} {placeholderText(copy.story) ? <PlaceholderBadge /> : null}
            </h2>
            <Markdown className="mt-4 text-muted">{copy.story}</Markdown>
          </div>
          <div className="rounded-2xl bg-navy p-8 text-white">
            <h2 className="text-2xl">{copy.missionTitle}</h2>
            <p className="mt-4 text-lg text-slate-200">{copy.mission}</p>
            <Image
              src="/brand/humsols-mark-dark.png"
              alt=""
              width={96}
              height={96}
              className="mt-8 opacity-90"
            />
          </div>
        </div>
      </Section>

      <Section eyebrow={copy.valuesEyebrow} title={copy.valuesTitle} soft>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {copy.values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent/20">
                <Icon name={v.icon} />
              </span>
              <h3 className="mt-4 text-base">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {team.length ? (
        <Section eyebrow={copy.teamEyebrow} title={copy.teamTitle}>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <li key={m.id} className="rounded-2xl border border-border bg-card p-6 text-center">
                {m.photo ? (
                  <Image
                    src={m.photo.url}
                    alt={m.photo.alt}
                    width={160}
                    height={160}
                    className="mx-auto size-28 rounded-full object-cover"
                  />
                ) : (
                  <span className="mx-auto flex size-28 items-center justify-center rounded-full bg-bg-soft text-muted">
                    <Icon name="users" className="size-10" />
                  </span>
                )}
                <h3 className="mt-4 text-base">{m.name}</h3>
                <p className="text-sm text-primary">{m.role}</p>
                <p className="mt-2 text-sm text-muted">{m.bio}</p>
                {placeholderText(m.name) ? <PlaceholderBadge className="mt-3" /> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CtaBand settings={settings} />
    </>
  );
}
