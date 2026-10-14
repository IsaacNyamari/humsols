import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, Section } from "@/components/site/sections";
import { Badge } from "@/components/ui/card";
import { getPageCopy, getPosts } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("blog");
  return pageMetadata({ title: copy.seoTitle, description: copy.seoDescription, path: "/blog" });
}

export default async function BlogPage() {
  const [copy, posts] = await Promise.all([getPageCopy("blog"), getPosts()]);
  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <Section>
        {posts.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {p.coverImage ? (
                  <Image
                    src={p.coverImage.url}
                    alt={p.coverImage.alt}
                    width={640}
                    height={360}
                    className="aspect-video w-full object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-royal to-navy" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  <h2 className="text-lg">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="after:absolute after:inset-0 group-hover:text-primary"
                    >
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted">{p.excerpt}</p>
                  {p.publishedAt ? (
                    <time dateTime={p.publishedAt} className="mt-4 text-xs text-muted">
                      {formatDate(p.publishedAt)}
                    </time>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
            {copy.empty}
          </p>
        )}
      </Section>
    </>
  );
}
