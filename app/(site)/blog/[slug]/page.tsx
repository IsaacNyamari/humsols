import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/card";
import { getPost } from "@/lib/data/public";
import { blogPostingJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage?.url,
    type: "article",
  });
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense
      fallback={<div className="container-page h-96 animate-pulse py-20" aria-busy="true" />}
    >
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-14 sm:py-20">
      <JsonLd data={blogPostingJsonLd(post)} />
      <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
        ← All articles
      </Link>
      <h1 className="mt-4 text-3xl sm:text-5xl">{post.title}</h1>
      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        ) : null}
        {post.authorName ? <span>by {post.authorName}</span> : null}
        {post.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </p>
      {post.coverImage ? (
        <Image
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          width={1200}
          height={630}
          className="mt-8 w-full rounded-2xl object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
        />
      ) : null}
      <Markdown className="mt-10 text-lg">{post.body}</Markdown>
    </article>
  );
}
