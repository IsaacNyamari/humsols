import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { LEAD_TYPE_LABELS, SERVICE_NAMES, type LeadType, type ServiceSlug } from "@/lib/constants";
import { getSiteSettings } from "@/lib/services/settings";
import { Lead, type EmailLogEntry } from "@/models";
import { sendMail } from "./transport";
import { layout, type Row } from "./templates";

function humanKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_.]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Flatten nested lead details into label/value rows. */
export function detailRows(details: Record<string, unknown>, prefix = ""): Row[] {
  const rows: Row[] = [];
  for (const [key, value] of Object.entries(details ?? {})) {
    const label = prefix ? `${prefix} › ${humanKey(key)}` : humanKey(key);
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      const items = value.map((v) =>
        typeof v === "string" && v in SERVICE_NAMES ? SERVICE_NAMES[v as ServiceSlug] : String(v),
      );
      rows.push([label, items.join(", ")]);
    } else if (typeof value === "object") {
      rows.push(...detailRows(value as Record<string, unknown>, label));
    } else if (typeof value === "boolean") {
      rows.push([label, value ? "Yes" : "No"]);
    } else {
      rows.push([label, String(value)]);
    }
  }
  return rows;
}

/**
 * Send the team notification and the customer auto-reply for a saved lead.
 * Failures are recorded on the lead (emailLog / emailFailed) and never thrown,
 * so a mail outage can never lose a lead.
 */
export async function sendLeadEmails(leadId: string): Promise<EmailLogEntry[]> {
  await connectDB();
  const lead = await Lead.findById(leadId).lean();
  if (!lead) return [];
  const settings = await getSiteSettings().catch(() => null);
  const recipients = settings?.notificationRecipients?.length
    ? settings.notificationRecipients
    : env.leadNotifyTo;
  const phones = settings?.phones ?? ["+254 725 742 737", "+254 711 777 992"];
  const whatsapp = settings?.whatsapp || "254725742737";
  const typeLabel = LEAD_TYPE_LABELS[lead.type as LeadType];
  const adminUrl = `${env.siteUrl}/admin/leads/${lead._id}`;

  const rows: Row[] = [
    ["Reference", lead.reference],
    ["Type", typeLabel],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Company", lead.company],
    ["Services", lead.services.map((s) => SERVICE_NAMES[s as ServiceSlug] ?? s).join(", ")],
    ["Message", lead.message],
    ...detailRows(lead.details as Record<string, unknown>).filter(
      ([label]) => label !== "Services",
    ),
    ["Source page", lead.sourcePage],
    ["Received", lead.createdAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })],
  ];

  const log: EmailLogEntry[] = [];

  const notification = layout({
    title: `New ${typeLabel.toLowerCase()} — ${lead.reference}`,
    intro: [`${lead.name} submitted a ${typeLabel.toLowerCase()} on the website.`],
    rows,
    cta: { label: "Open in admin", href: adminUrl },
  });
  try {
    await sendMail({
      to: recipients,
      replyTo: lead.email,
      subject: `[${lead.reference}] New ${typeLabel.toLowerCase()} from ${lead.name}`,
      ...notification,
    });
    log.push({ kind: "notification", to: recipients.join(", "), status: "sent", at: new Date() });
  } catch (err) {
    log.push({
      kind: "notification",
      to: recipients.join(", "),
      status: "failed",
      error: errorMessage(err),
      at: new Date(),
    });
  }

  const reply = layout({
    title: `We've received your request — ${lead.reference}`,
    intro: [
      `Hi ${lead.name.split(" ")[0]},`,
      `Thank you for contacting Human Solutions. Your reference number is ${lead.reference}. Please quote it if you get in touch with us about this request.`,
      "What happens next: one of our team will review your request and contact you, usually within one working day. For anything urgent, call or WhatsApp us.",
    ],
    rows: [
      ["Reference", lead.reference],
      ["Request", typeLabel],
      ["Phone", phones.join(" / ")],
      ["WhatsApp", `https://wa.me/${whatsapp.replace(/\D/g, "")}`],
      ["Email", settings?.email ?? "info@humsols.com"],
    ],
    cta: {
      label: "Chat with us on WhatsApp",
      href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    },
  });
  try {
    await sendMail({
      to: lead.email,
      subject: `Your request ${lead.reference} — Human Solutions`,
      ...reply,
    });
    log.push({ kind: "auto_reply", to: lead.email, status: "sent", at: new Date() });
  } catch (err) {
    log.push({
      kind: "auto_reply",
      to: lead.email,
      status: "failed",
      error: errorMessage(err),
      at: new Date(),
    });
  }

  const failed = log.some((l) => l.status === "failed");
  if (failed)
    console.error(
      `[mail] lead ${lead.reference}: email delivery failed`,
      log.filter((l) => l.status === "failed"),
    );
  await Lead.updateOne(
    { _id: lead._id },
    { $push: { emailLog: { $each: log } }, $set: { emailFailed: failed } },
  );
  return log;
}

function errorMessage(err: unknown) {
  return (err instanceof Error ? err.message : String(err)).slice(0, 500);
}
