import type { Metadata } from "next";
import type { SiteSettings } from "@/lib/services/settings";
import type { FaqDTO, PostDTO, ServiceDTO } from "@/lib/types";

export const siteUrl = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const images = image
    ? [{ url: image }]
    : [{ url: "/brand/humsols-logo.png", width: 868, height: 184, alt: "Human Solutions" }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, images },
    twitter: { title, description },
  };
}

export function organizationJsonLd(s: SiteSettings) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: s.companyName,
        alternateName: s.shortName,
        url,
        logo: `${url}/brand/humsols-logo.png`,
        email: s.email,
        telephone: s.phones[0],
        sameAs: s.social.map((x) => x.url),
      },
      {
        "@type": "LocalBusiness",
        "@id": `${url}/#localbusiness`,
        name: s.companyName,
        url,
        image: `${url}/brand/humsols-logo.png`,
        email: s.email,
        telephone: s.phones,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Westlands",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        areaServed: "Kenya",
        currenciesAccepted: "KES",
        parentOrganization: { "@id": `${url}/#organization` },
      },
    ],
  };
}

export function serviceJsonLd(service: ServiceDTO) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    url: `${url}/services/${service.slug}`,
    areaServed: "Kenya",
    provider: { "@id": `${url}/#organization` },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[] | FaqDTO[]) {
  const items = faqs
    .map((f) => ("q" in f ? { q: f.q, a: f.a } : { q: f.question, a: f.answer }))
    .filter((f) => !f.a.includes("[PLACEHOLDER"));
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function blogPostingJsonLd(post: PostDTO) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `${url}/blog/${post.slug}`,
    image: post.coverImage ? new URL(post.coverImage.url, url).toString() : undefined,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@id": `${url}/#organization` },
    publisher: { "@id": `${url}/#organization` },
  };
}
