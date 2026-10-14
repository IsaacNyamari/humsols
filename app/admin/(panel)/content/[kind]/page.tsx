import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublishToggle, RowActions } from "@/components/admin/content-row-actions";
import { AdminPageTitle } from "@/components/admin/page-title";
import { Icon } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { PlaceholderBadge } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { kindConfig } from "@/lib/admin/content-config";
import { requireActor } from "@/lib/auth/session";
import { isContentKind, isPublished, listContent } from "@/lib/services/content";
import { placeholderText } from "@/lib/utils";

export const metadata: Metadata = { title: "Content" };

export default async function ContentListPage({ params }: PageProps<"/admin/content/[kind]">) {
  const actor = await requireActor("content:write");
  const { kind } = await params;
  const config = kindConfig(kind);
  if (!config || !isContentKind(kind)) notFound();
  const docs = await listContent(actor, kind);

  return (
    <>
      <AdminPageTitle
        title={config.plural}
        description={config.description}
        actions={
          <Link href={`/admin/content/${kind}/new`} className={buttonClass({ size: "sm" })}>
            <Icon name="plus" className="size-4" /> New {config.label.toLowerCase()}
          </Link>
        }
      />
      {docs.length ? (
        <Table>
          <thead>
            <tr>
              <Th>{config.label}</Th>
              <Th>Status</Th>
              {config.ordered ? <Th>Order</Th> : null}
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => {
              const title = String(doc[config.titleField] ?? "(untitled)");
              return (
                <tr key={doc.id} className="hover:bg-bg-soft">
                  <Td>
                    <Link
                      href={`/admin/content/${kind}/${doc.id}`}
                      className="font-semibold hover:text-primary"
                    >
                      {title}
                    </Link>
                    {placeholderText(title) || doc.isPlaceholder ? (
                      <PlaceholderBadge className="ml-2" />
                    ) : null}
                    {config.subtitle ? (
                      <span className="block text-xs text-muted">{config.subtitle(doc)}</span>
                    ) : null}
                  </Td>
                  <Td>
                    <PublishToggle
                      kind={kind}
                      id={doc.id}
                      published={isPublished(kind, doc)}
                      labels={config.publishedLabel}
                    />
                  </Td>
                  {config.ordered ? (
                    <Td className="tabular-nums text-muted">{String(doc.order ?? 0)}</Td>
                  ) : null}
                  <Td>
                    <RowActions
                      kind={kind}
                      id={doc.id}
                      title={title}
                      ordered={config.ordered}
                      first={i === 0}
                      last={i === docs.length - 1}
                      publicPath={config.publicPath?.(doc)}
                    />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-muted">Nothing here yet.</p>
          <Link href={`/admin/content/${kind}/new`} className={buttonClass({ size: "sm" }, "mt-4")}>
            Add the first {config.label.toLowerCase()}
          </Link>
        </div>
      )}
    </>
  );
}
