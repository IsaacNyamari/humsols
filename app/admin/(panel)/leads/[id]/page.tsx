import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AssignSelect,
  DeleteLeadButton,
  NoteForm,
  ResendEmailsButton,
  StatusPipeline,
} from "@/components/admin/lead-actions";
import { TypeBadge } from "@/components/admin/lead-badges";
import { Icon } from "@/components/icons";
import { ButtonA } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { requireActor } from "@/lib/auth/session";
import { SERVICE_NAMES, type ServiceSlug } from "@/lib/constants";
import { detailRows } from "@/lib/mail/lead-emails";
import { can } from "@/lib/permissions";
import { getLead } from "@/lib/services/leads";
import { listAssignableUsers } from "@/lib/services/users";
import { formatDate, telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const actor = await requireActor("leads:read");
  const { id } = await params;
  const [lead, users] = await Promise.all([getLead(actor, id), listAssignableUsers(actor)]);
  if (!lead) notFound();

  const rows = detailRows(lead.details).filter(([label]) => label !== "Services");
  const waText = `Hello ${lead.name.split(" ")[0]}, this is Human Solutions regarding your request ${lead.reference}.`;

  return (
    <>
      <Link href="/admin/leads" className="text-sm font-semibold text-primary hover:underline">
        ← All leads
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl" data-testid="lead-heading">
          {lead.reference}
        </h1>
        <TypeBadge type={lead.type} />
        {lead.emailFailed ? <Badge tone="danger">Email delivery failed</Badge> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-base">Status</h2>
            <StatusPipeline id={lead.id} status={lead.status} />
          </Card>

          <Card>
            <h2 className="mb-4 text-base">Customer</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Item label="Name" value={lead.name} />
              <Item label="Company" value={lead.company} />
              <Item label="Phone" value={lead.phone} />
              <Item label="Email" value={lead.email} />
              <Item
                label="Services"
                value={lead.services.map((s) => SERVICE_NAMES[s as ServiceSlug] ?? s).join(", ")}
              />
              <Item label="Received" value={formatDate(lead.createdAt, true)} />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonA href={telHref(lead.phone)} size="sm">
                <Icon name="phone" className="size-4" /> Call
              </ButtonA>
              <ButtonA
                href={whatsappHref(lead.phone, waText)}
                size="sm"
                variant="outline"
                rel="noopener"
              >
                <Icon name="whatsapp" className="size-4" /> WhatsApp
              </ButtonA>
              <ButtonA
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your request ${lead.reference} — Human Solutions`)}`}
                size="sm"
                variant="outline"
              >
                <Icon name="mail" className="size-4" /> Email
              </ButtonA>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-base">Request details</h2>
            {lead.message ? (
              <p className="mb-4 rounded-lg bg-bg-soft p-4 text-sm whitespace-pre-wrap">
                {lead.message}
              </p>
            ) : null}
            {rows.length ? (
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {rows.map(([label, value]) => (
                  <Item key={label} label={label} value={String(value)} />
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted">No extra details.</p>
            )}
            {typeof lead.details.lat === "number" && typeof lead.details.lng === "number" ? (
              <a
                href={`https://www.google.com/maps?q=${lead.details.lat},${lead.details.lng}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                rel="noopener"
                target="_blank"
              >
                <Icon name="pin" className="size-4" /> Open pinned location in Google Maps
              </a>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-4 text-base">Internal notes</h2>
            {lead.notes.length ? (
              <ol className="mb-5 space-y-3" data-testid="lead-notes">
                {lead.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.text}</p>
                    <p className="mt-1 text-xs text-muted">
                      {n.byName} · {formatDate(n.at, true)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mb-4 text-sm text-muted">No notes yet.</p>
            )}
            {can(actor.role, "leads:write") ? <NoteForm id={lead.id} /> : null}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <AssignSelect id={lead.id} assignedTo={lead.assignedTo?.id} users={users} />
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base">Emails</h2>
              <ResendEmailsButton id={lead.id} />
            </div>
            {lead.emailLog.length ? (
              <ul className="space-y-2 text-sm">
                {lead.emailLog.map((e, i) => (
                  <li key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {e.kind === "notification" ? "Team notification" : "Customer auto-reply"}
                      </span>
                      <Badge tone={e.status === "sent" ? "success" : "danger"}>{e.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {e.to} · {formatDate(e.at, true)}
                    </p>
                    {e.error ? <p className="mt-1 text-xs text-danger">{e.error}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Emails are queued just after submission.</p>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-base">Source</h2>
            <dl className="space-y-2 text-sm">
              <Item label="Page" value={lead.sourcePage} />
              <Item
                label="UTM"
                value={
                  lead.utm
                    ? Object.entries(lead.utm)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")
                    : undefined
                }
              />
              <Item
                label="Consent"
                value={lead.consent.given ? `Given ${formatDate(lead.consent.at, true)}` : "No"}
              />
              <Item label="IP address" value={lead.ip} />
              <Item label="Browser" value={lead.userAgent} />
            </dl>
          </Card>

          {can(actor.role, "settings:write") ? (
            <DeleteLeadButton id={lead.id} reference={lead.reference} />
          ) : null}
        </div>
      </div>
    </>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="break-words font-medium">{value || "—"}</dd>
    </div>
  );
}
