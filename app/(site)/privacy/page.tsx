import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getPageCopy } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy("privacy");
  return pageMetadata({ title: copy.seoTitle, description: copy.seoDescription, path: "/privacy" });
}

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
