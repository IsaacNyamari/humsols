import { Types, type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import {
  LEAD_STATUSES,
  LEAD_TYPE_CODES,
  LEAD_TYPES,
  SERVICE_SLUGS,
  type LeadStatus,
  type LeadType,
  type ServiceSlug,
} from "@/lib/constants";
import { assertCan, type Actor } from "@/lib/permissions";
import { toPlain } from "@/lib/utils";
import type { LeadSubmission } from "@/lib/validation/lead";
import { Counter, Lead, User, type ILead } from "@/models";
import { writeAudit } from "./audit";

// ------------------------------------------------------------ creation (public)

export function nairobiYear(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-KE", { year: "numeric", timeZone: "Africa/Nairobi" }).format(date),
  );
}

/** Allocate the next human-readable reference, e.g. HS-Q-2026-0001 (atomic per type and year). */
export async function nextReference(type: LeadType, date = new Date()) {
  const code = LEAD_TYPE_CODES[type];
  const year = nairobiYear(date);
  const counter = await Counter.findOneAndUpdate(
    { _id: `lead-${code}-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  ).lean();
  return `HS-${code}-${year}-${String(counter!.seq).padStart(4, "0")}`;
}

/** Services a lead relates to, derived from its type and details. */
export function servicesFor(submission: LeadSubmission): ServiceSlug[] {
  switch (submission.type) {
    case "quote":
      return submission.details.services;
    case "internet_coverage":
    case "internet_installation":
      return ["internet"];
    case "cctv_survey":
      return ["cctv-installation"];
    case "support": {
      const map: Partial<Record<string, ServiceSlug>> = {
        internet: "internet",
        cctv: "cctv-installation",
        software: "custom-software",
        website: "websites",
      };
      const s = map[submission.details.category];
      return s ? [s] : [];
    }
    default:
      return [];
  }
}

export type LeadMeta = { ip?: string; userAgent?: string };

export async function createLead(submission: LeadSubmission, meta: LeadMeta = {}) {
  await connectDB();
  const now = new Date();
  const reference = await nextReference(submission.type, now);
  const lead = await Lead.create({
    type: submission.type,
    reference,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    company: submission.company,
    services: servicesFor(submission),
    message: submission.message,
    details: submission.details,
    sourcePage: submission.sourcePage,
    utm: submission.utm,
    status: "new",
    ip: meta.ip,
    userAgent: meta.userAgent?.slice(0, 500),
    consent: { given: true, at: now },
  });
  return { id: String(lead._id), reference };
}

// ------------------------------------------------------------ admin queries

export type LeadDTO = {
  id: string;
  type: LeadType;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  services: string[];
  message?: string;
  details: Record<string, unknown>;
  sourcePage?: string;
  utm?: Record<string, string>;
  status: LeadStatus;
  assignedTo?: { id: string; name: string } | null;
  notes: { id: string; byName?: string; text: string; at: string }[];
  ip?: string;
  userAgent?: string;
  consent: { given: boolean; at: string };
  emailLog: { kind: string; to: string; status: string; error?: string; at: string }[];
  emailFailed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeadFilters = {
  q?: string;
  type?: string;
  status?: string;
  service?: string;
  assignee?: string;
  from?: string;
  to?: string;
  /** "1" = only leads whose emails failed */
  emailFailed?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(f: LeadFilters): QueryFilter<ILead> {
  const query: QueryFilter<ILead> = {};
  if (f.type && (LEAD_TYPES as readonly string[]).includes(f.type)) query.type = f.type as LeadType;
  if (f.status && (LEAD_STATUSES as readonly string[]).includes(f.status))
    query.status = f.status as LeadStatus;
  if (f.service && (SERVICE_SLUGS as readonly string[]).includes(f.service))
    query.services = f.service;
  if (f.assignee === "unassigned") query.assignedTo = null;
  else if (f.assignee && Types.ObjectId.isValid(f.assignee))
    query.assignedTo = new Types.ObjectId(f.assignee);
  const created: Record<string, Date> = {};
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from))
    created.$gte = new Date(`${f.from}T00:00:00+03:00`);
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to))
    created.$lte = new Date(`${f.to}T23:59:59.999+03:00`);
  if (Object.keys(created).length) query.createdAt = created;
  if (f.emailFailed === "1") query.emailFailed = true;
  if (f.q?.trim()) {
    const rx = new RegExp(f.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { name: rx },
      { email: rx },
      { phone: rx },
      { company: rx },
      { reference: rx },
      { message: rx },
    ];
  }
  return query;
}

function toDTO(doc: unknown): LeadDTO {
  const d = toPlain<Record<string, unknown> & { _id: string }>(doc);
  const assigned = d.assignedTo as { _id: string; name: string } | string | null | undefined;
  return {
    ...(d as unknown as LeadDTO),
    id: d._id,
    assignedTo:
      assigned && typeof assigned === "object" ? { id: assigned._id, name: assigned.name } : null,
    notes: ((d.notes as { _id: string; byName?: string; text: string; at: string }[]) ?? []).map(
      (n) => ({
        id: n._id,
        byName: n.byName,
        text: n.text,
        at: n.at,
      }),
    ),
  };
}

export async function listLeads(actor: Actor, filters: LeadFilters) {
  assertCan(actor, "leads:read");
  await connectDB();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 25, 1), 200);
  const page = Math.max(filters.page ?? 1, 1);
  const query = buildQuery(filters);
  const [items, total] = await Promise.all([
    Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("assignedTo", "name")
      .lean(),
    Lead.countDocuments(query),
  ]);
  return {
    items: items.map(toDTO),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLead(actor: Actor, id: string) {
  assertCan(actor, "leads:read");
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await Lead.findById(id).populate("assignedTo", "name").lean();
  return doc ? toDTO(doc) : null;
}

export async function updateLeadStatus(actor: Actor, id: string, status: LeadStatus) {
  assertCan(actor, "leads:write");
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status");
  await connectDB();
  const before = await Lead.findById(id, { status: 1 }).lean();
  if (!before) throw new Error("Lead not found");
  await Lead.updateOne({ _id: id }, { $set: { status } });
  await writeAudit(actor, "update", "Lead", id, { status: { from: before.status, to: status } });
}

export async function assignLead(actor: Actor, id: string, userId: string | null) {
  assertCan(actor, "leads:write");
  await connectDB();
  let assignee: Types.ObjectId | null = null;
  if (userId) {
    const user = await User.findOne({ _id: userId, active: true }, { _id: 1 }).lean();
    if (!user) throw new Error("User not found");
    assignee = user._id;
  }
  const res = await Lead.updateOne({ _id: id }, { $set: { assignedTo: assignee } });
  if (!res.matchedCount) throw new Error("Lead not found");
  await writeAudit(actor, "assign", "Lead", id, { assignedTo: userId });
}

export async function addLeadNote(actor: Actor, id: string, text: string) {
  assertCan(actor, "leads:write");
  const clean = text.trim();
  if (!clean) throw new Error("Note cannot be empty");
  if (clean.length > 5000) throw new Error("Note is too long");
  await connectDB();
  const res = await Lead.updateOne(
    { _id: id },
    { $push: { notes: { by: actor.id, byName: actor.name, text: clean, at: new Date() } } },
  );
  if (!res.matchedCount) throw new Error("Lead not found");
  await writeAudit(actor, "note", "Lead", id, { note: clean.slice(0, 200) });
}

export async function deleteLead(actor: Actor, id: string) {
  assertCan(actor, "settings:write"); // owners/admins only
  await connectDB();
  await Lead.deleteOne({ _id: id });
  await writeAudit(actor, "delete", "Lead", id);
}

// ------------------------------------------------------------ export & stats

function csvCell(value: unknown) {
  let s =
    value === undefined || value === null
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value);
  // Prevent CSV/formula injection when opened in Excel.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function exportLeadsCsv(actor: Actor, filters: LeadFilters) {
  assertCan(actor, "leads:read");
  await connectDB();
  const docs = await Lead.find(buildQuery(filters))
    .sort({ createdAt: -1 })
    .limit(10000)
    .populate("assignedTo", "name")
    .lean();
  const header = [
    "reference",
    "type",
    "status",
    "createdAt",
    "name",
    "email",
    "phone",
    "company",
    "services",
    "message",
    "details",
    "assignedTo",
    "sourcePage",
    "emailFailed",
  ];
  const rows = docs.map((raw) => {
    const d = toDTO(raw);
    return [
      d.reference,
      d.type,
      d.status,
      d.createdAt,
      d.name,
      d.email,
      d.phone,
      d.company,
      d.services.join("; "),
      d.message,
      d.details,
      d.assignedTo?.name,
      d.sourcePage,
      d.emailFailed,
    ]
      .map(csvCell)
      .join(",");
  });
  await writeAudit(actor, "export", "Lead", undefined, { count: docs.length, filters });
  return [header.join(","), ...rows].join("\r\n");
}

export async function leadStats(actor: Actor, now = new Date()) {
  assertCan(actor, "leads:read");
  await connectDB();
  // Day and week boundaries in Nairobi time (UTC+3, no DST).
  const nairobi = new Date(now.getTime() + 3 * 3600_000);
  const startOfDay = new Date(
    Date.UTC(nairobi.getUTCFullYear(), nairobi.getUTCMonth(), nairobi.getUTCDate()) - 3 * 3600_000,
  );
  const dow = (nairobi.getUTCDay() + 6) % 7; // Monday = 0
  const startOfWeek = new Date(startOfDay.getTime() - dow * 86400_000);

  const [today, week, total, won, byType, byStatus, latest, failedEmails] = await Promise.all([
    Lead.countDocuments({ createdAt: { $gte: startOfDay } }),
    Lead.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Lead.countDocuments({}),
    Lead.countDocuments({ status: "won" }),
    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    Lead.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Lead.find({}).sort({ createdAt: -1 }).limit(8).populate("assignedTo", "name").lean(),
    Lead.countDocuments({ emailFailed: true }),
  ]);

  return {
    today,
    week,
    total,
    won,
    conversion: total ? won / total : 0,
    byType: Object.fromEntries(byType.map((r) => [r._id, r.count])) as Record<string, number>,
    byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])) as Record<string, number>,
    latest: latest.map(toDTO),
    failedEmails,
  };
}
