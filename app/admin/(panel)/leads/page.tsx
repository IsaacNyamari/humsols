import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge, TypeBadge } from "@/components/admin/lead-badges";
import { AdminPageTitle } from "@/components/admin/page-title";
import { Icon } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { requireActor } from "@/lib/auth/session";
import {
  LEAD_STATUSES,
  LEAD_TYPE_LABELS,
  LEAD_TYPES,
  SERVICE_NAMES,
  SERVICE_SLUGS,
  type ServiceSlug,
} from "@/lib/constants";
import { listLeads, type LeadFilters } from "@/lib/services/leads";
import { listAssignableUsers } from "@/lib/services/users";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };

const FILTER_KEYS = [
  "q",
  "type",
  "status",
  "service",
  "assignee",
  "from",
  "to",
  "emailFailed",
] as const;

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  const actor = await requireActor("leads:read");
  const sp = await props.searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const filters: LeadFilters = Object.fromEntries(FILTER_KEYS.map((k) => [k, get(k)]));
  const page = Math.max(1, Number(get("page")) || 1);

  const [result, users] = await Promise.all([
    listLeads(actor, { ...filters, page, pageSize: 25 }),
    listAssignableUsers(actor),
  ]);
  const query = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1])),
  );
  const pageHref = (p: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(p));
    return `/admin/leads?${q}`;
  };

  return (
    <>
      <AdminPageTitle
        title="Leads"
        description={`${result.total} lead${result.total === 1 ? "" : "s"} match`}
        actions={
          <a
            href={`/api/admin/leads/export?${query}`}
            className={buttonClass({ variant: "outline", size: "sm" })}
          >
            <Icon name="download" className="size-4" /> Export CSV
          </a>
        }
      />

      <form
        method="get"
        className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
        role="search"
        aria-label="Filter leads"
      >
        <label className="sm:col-span-2">
          <span className="sr-only">Search</span>
          <Input
            name="q"
            defaultValue={filters.q}
            placeholder="Search name, email, phone, reference…"
          />
        </label>
        <label>
          <span className="sr-only">Type</span>
          <Select name="type" defaultValue={filters.type ?? ""}>
            <option value="">All types</option>
            {LEAD_TYPES.map((t) => (
              <option key={t} value={t}>
                {LEAD_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Service</span>
          <Select name="service" defaultValue={filters.service ?? ""}>
            <option value="">All services</option>
            {SERVICE_SLUGS.map((s) => (
              <option key={s} value={s}>
                {SERVICE_NAMES[s]}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Assigned to</span>
          <Select name="assignee" defaultValue={filters.assignee ?? ""}>
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 text-muted">From</span>
          <Input type="date" name="from" defaultValue={filters.from} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 text-muted">To</span>
          <Input type="date" name="to" defaultValue={filters.to} />
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className={buttonClass({ size: "sm" })}>
            <Icon name="search" className="size-4" /> Apply filters
          </button>
          <Link href="/admin/leads" className={buttonClass({ variant: "ghost", size: "sm" })}>
            Clear
          </Link>
        </div>
      </form>

      {result.items.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Reference</Th>
              <Th>Contact</Th>
              <Th>Type</Th>
              <Th>Services</Th>
              <Th>Status</Th>
              <Th>Assigned</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((l) => (
              <tr key={l.id} className="hover:bg-bg-soft">
                <Td>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="font-semibold whitespace-nowrap text-primary hover:underline"
                  >
                    {l.reference}
                  </Link>
                  {l.emailFailed ? (
                    <Badge tone="danger" className="mt-1">
                      email failed
                    </Badge>
                  ) : null}
                </Td>
                <Td>
                  <span className="block font-medium">{l.name}</span>
                  <span className="text-xs text-muted">
                    {l.phone} · {l.email}
                  </span>
                </Td>
                <Td>
                  <TypeBadge type={l.type} />
                </Td>
                <Td className="text-xs">
                  {l.services.map((s) => SERVICE_NAMES[s as ServiceSlug] ?? s).join(", ")}
                </Td>
                <Td>
                  <StatusBadge status={l.status} />
                </Td>
                <Td className="text-sm">
                  {l.assignedTo?.name ?? <span className="text-muted">—</span>}
                </Td>
                <Td className="whitespace-nowrap text-sm text-muted">
                  {formatDate(l.createdAt, true)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted">
          No leads match these filters.
        </p>
      )}

      {result.pages > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {result.page} of {result.pages}
          </span>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={pageHref(result.page - 1)}
                className={buttonClass({ variant: "outline", size: "sm" })}
              >
                ← Previous
              </Link>
            ) : null}
            {result.page < result.pages ? (
              <Link
                href={pageHref(result.page + 1)}
                className={buttonClass({ variant: "outline", size: "sm" })}
              >
                Next →
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
