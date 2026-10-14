import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { AdminPageTitle } from "@/components/admin/page-title";
import { kindConfig } from "@/lib/admin/content-config";
import { requireActor } from "@/lib/auth/session";
import { getContent, isContentKind, listContent } from "@/lib/services/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit content" };

/** Handles both /admin/content/<kind>/new and /admin/content/<kind>/<id>. */
export default async function ContentEditPage({ params }: PageProps<"/admin/content/[kind]/[id]">) {
  const actor = await requireActor("content:write");
  const { kind, id } = await params;
  const config = kindConfig(kind);
  if (!config || !isContentKind(kind)) notFound();

  const isNew = id === "new";
  const doc = isNew ? {} : await getContent(actor, kind, id);
  if (!doc) notFound();

  const serviceOptions =
    kind === "projects"
      ? (await listContent(actor, "services")).map((s) => ({ id: s.id, title: String(s.title) }))
      : [];

  return (
    <>
      <AdminPageTitle
        title={
          isNew
            ? `New ${config.label.toLowerCase()}`
            : String((doc as Record<string, unknown>)[config.titleField] ?? config.label)
        }
        description={
          isNew
            ? config.description
            : `Last updated ${formatDate(String((doc as Record<string, unknown>).updatedAt), true)}`
        }
      />
      <ContentEditor
        kind={kind}
        id={isNew ? null : id}
        initial={doc as Record<string, unknown>}
        serviceOptions={serviceOptions}
      />
    </>
  );
}
