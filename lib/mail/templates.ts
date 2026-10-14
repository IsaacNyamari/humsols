import { env } from "@/lib/env";

// Branded, table-based HTML emails (email clients ignore most modern CSS) with
// plain-text alternatives.

const C = { navy: "#010C1B", royal: "#0B58AD", aqua: "#00DACE", text: "#1f2937", muted: "#6b7280" };

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type Row = [label: string, value: unknown];

export function layout({
  title,
  intro,
  rows = [],
  cta,
  footer,
}: {
  title: string;
  intro: string[];
  rows?: Row[];
  cta?: { label: string; href: string };
  footer?: string;
}) {
  const logo = `${env.siteUrl}/brand/humsols-logo-dark.png`;
  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([label, value]) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${C.muted};font-size:13px;width:38%;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${C.text};font-size:14px;white-space:pre-wrap">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
  <tr><td style="background:${C.navy};padding:20px 24px">
    <img src="${logo}" width="170" alt="Human Solutions" style="display:block;border:0;height:auto">
  </td></tr>
  <tr><td style="height:4px;background:${C.aqua};line-height:4px;font-size:0">&nbsp;</td></tr>
  <tr><td style="padding:28px 24px 8px">
    <h1 style="margin:0 0 12px;font-size:20px;color:${C.navy}">${escapeHtml(title)}</h1>
    ${intro.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:${C.text}">${escapeHtml(p)}</p>`).join("")}
  </td></tr>
  ${rowsHtml ? `<tr><td style="padding:8px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px">${rowsHtml}</table></td></tr>` : ""}
  ${cta ? `<tr><td style="padding:20px 24px"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:${C.royal};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">${escapeHtml(cta.label)}</a></td></tr>` : ""}
  <tr><td style="padding:16px 24px 24px;color:${C.muted};font-size:12px;line-height:1.5">
    ${escapeHtml(footer ?? "Human Solutions (HumSols) · Westlands, Nairobi, Kenya · info@humsols.com")}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    title,
    "",
    ...intro,
    "",
    ...rows
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([l, v]) => `${l}: ${String(v)}`),
    ...(cta ? ["", `${cta.label}: ${cta.href}`] : []),
    "",
    "--",
    footer ?? "Human Solutions (HumSols) · Westlands, Nairobi, Kenya · info@humsols.com",
  ].join("\n");

  return { html, text };
}
