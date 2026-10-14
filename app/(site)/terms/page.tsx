import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getPageCopy } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("terms");
  return pageMetadata({ title: copy.seoTitle, description: copy.seoDescription, path: "/terms" });
}

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
