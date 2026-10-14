import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description: "Terms for using the Human Solutions website and requesting quotes and services.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
