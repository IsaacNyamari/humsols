import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How Human Solutions collects, uses and protects personal data under the Kenya Data Protection Act, 2019.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
