import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { buttonClass } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/table";
import { requireActor } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { formatDate, toPlain } from "@/lib/utils";
import { AuditLog } from "@/models";

export const metadata: Metadata = { title: "Audit log" };

const PAGE_SIZE = 50;

export default async function AuditPage(props: PageProps<"/admin/audit">) {
  await requireActor("audit:read");
  const sp = await props.searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  await connectDB();
  const [entries, total] = await Promise.all([
    AuditLog.find({})
      .sort({ at: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    AuditLog.estimatedDocumentCount(),
  ]);
  const rows = toPlain<
    {
      _id: string;
      userName?: string;
      action: string;
      entity: string;
      entityId?: string;
      changes?: unknown;
      at: string;
    }[]
  >(entries);

  return (
    <>
      <AdminPageTitle
        title="Audit log"
        description="Every create, update and delete in the admin."
      />
      <Table>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Who</Th>
            <Th>Action</Th>
            <Th>Item</Th>
            <Th>Changes</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <Td className="whitespace-nowrap text-sm text-muted">{formatDate(r.at, true)}</Td>
              <Td className="text-sm">{r.userName ?? "system"}</Td>
              <Td className="text-sm font-semibold capitalize">{r.action.replace(/_/g, " ")}</Td>
              <Td className="text-sm">
                {r.entity}
                {r.entity === "Lead" && r.entityId ? (
                  <Link
                    href={`/admin/leads/${r.entityId}`}
                    className="ml-1 text-primary hover:underline"
                  >
                    open
                  </Link>
                ) : null}
              </Td>
              <Td>
                {r.changes ? (
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold text-primary">
                      View
                    </summary>
                    <pre className="mt-2 max-w-md overflow-x-auto rounded bg-bg-soft p-2 text-xs">
                      {JSON.stringify(r.changes, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <nav aria-label="Pagination" className="mt-4 flex gap-2">
        {page > 1 ? (
          <Link
            href={`/admin/audit?page=${page - 1}`}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            ← Newer
          </Link>
        ) : null}
        {page * PAGE_SIZE < total ? (
          <Link
            href={`/admin/audit?page=${page + 1}`}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            Older →
          </Link>
        ) : null}
      </nav>
    </>
  );
}
