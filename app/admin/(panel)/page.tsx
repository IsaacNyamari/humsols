import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge, TypeBadge } from "@/components/admin/lead-badges";
import { AdminPageTitle, StatCard } from "@/components/admin/page-title";
import { Icon } from "@/components/icons";
import { Table, Td, Th } from "@/components/ui/table";
import { requireActor } from "@/lib/auth/session";
import { LEAD_STATUSES, LEAD_TYPE_LABELS, LEAD_TYPES } from "@/lib/constants";
import { can } from "@/lib/permissions";
import { leadStats } from "@/lib/services/leads";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const quickLinks = [
  { href: "/admin/content/services", label: "Edit services", icon: "app", perm: "content:write" },
  {
    href: "/admin/content/posts/new",
    label: "Write a blog post",
    icon: "file",
    perm: "content:write",
  },
  {
    href: "/admin/content/packages",
    label: "Internet packages",
    icon: "wifi",
    perm: "content:write",
  },
  {
    href: "/admin/content/projects/new",
    label: "Add a project",
    icon: "briefcase",
    perm: "content:write",
  },
  { href: "/admin/leads?status=new", label: "New leads", icon: "inbox", perm: "leads:read" },
  { href: "/admin/settings", label: "Site settings", icon: "settings", perm: "settings:write" },
] as const;

export default async function DashboardPage() {
  const actor = await requireActor("dashboard:view");
  const stats = can(actor.role, "leads:read") ? await leadStats(actor) : null;

  return (
    <>
      <AdminPageTitle
        title={`Welcome, ${actor.name.split(" ")[0]}`}
        description="Here's what's happening on humsols.com."
      />

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="New leads today" value={stats.today} />
            <StatCard
              label="Leads this week"
              value={stats.week}
              hint="Since Monday (Nairobi time)"
            />
            <StatCard label="All leads" value={stats.total} />
            <StatCard
              label="Conversion"
              value={`${(stats.conversion * 100).toFixed(1)}%`}
              hint={`${stats.won} won ÷ ${stats.total} total`}
            />
          </div>

          {stats.failedEmails ? (
            <Link
              href="/admin/leads?emailFailed=1"
              className="mt-4 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
            >
              <Icon name="mail" className="size-4" /> {stats.failedEmails} lead(s) had email
              delivery failures — check the SMTP settings.
            </Link>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Breakdown
              title="Leads by type"
              rows={LEAD_TYPES.map((t) => [
                LEAD_TYPE_LABELS[t],
                stats.byType[t] ?? 0,
                `/admin/leads?type=${t}`,
              ])}
            />
            <Breakdown
              title="Leads by status"
              rows={LEAD_STATUSES.map((s) => [
                s,
                stats.byStatus[s] ?? 0,
                `/admin/leads?status=${s}`,
              ])}
            />
          </div>

          <h2 className="mt-8 mb-3 text-lg">Latest leads</h2>
          {stats.latest.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Received</Th>
                </tr>
              </thead>
              <tbody>
                {stats.latest.map((l) => (
                  <tr key={l.id} className="hover:bg-bg-soft">
                    <Td>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {l.reference}
                      </Link>
                    </Td>
                    <Td>{l.name}</Td>
                    <Td>
                      <TypeBadge type={l.type} />
                    </Td>
                    <Td>
                      <StatusBadge status={l.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted">
                      {formatDate(l.createdAt, true)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted">
              No leads yet.
            </p>
          )}
        </>
      ) : null}

      <h2 className="mt-8 mb-3 text-lg">Quick links</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks
          .filter((q) => can(actor.role, q.perm))
          .map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 font-semibold hover:border-primary/50"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={q.icon} className="size-4" />
              </span>
              {q.label}
            </Link>
          ))}
      </div>
    </>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number, string][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-base">{title}</h2>
      <ul className="space-y-2.5">
        {rows.map(([label, count, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="group grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3 text-sm"
            >
              <span className="truncate capitalize group-hover:text-primary">{label}</span>
              <span className="h-2.5 rounded-full bg-bg-soft">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
