import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageCopyEditor } from "@/components/admin/page-copy-editor";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireActor } from "@/lib/auth/session";
import { isPageKey, PAGES } from "@/lib/page-content/registry";
import { readPageCopy } from "@/lib/services/page-content";

export const metadata: Metadata = { title: "Edit page text" };

export default async function EditPageCopy({ params }: PageProps<"/admin/pages/[key]">) {
  await requireActor("content:write");
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  const copy = await readPageCopy(key);
  return (
    <>
      <Link href="/admin/pages" className="text-sm font-semibold text-primary hover:underline">
        ← All pages
      </Link>
      <AdminPageTitle title={PAGES[key].label} description={`Text on ${PAGES[key].path}`} />
      <PageCopyEditor pageKey={key} initial={copy as Record<string, unknown>} />
    </>
  );
}
