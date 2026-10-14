import { actorFor } from "@/lib/auth/session";
import { exportLeadsCsv } from "@/lib/services/leads";

export async function GET(request: Request) {
  const actor = await actorFor("leads:read");
  if (!actor) return new Response("Not allowed", { status: 403 });

  const sp = new URL(request.url).searchParams;
  const pick = (k: string) => sp.get(k) ?? undefined;
  const csv = await exportLeadsCsv(actor, {
    q: pick("q"),
    type: pick("type"),
    status: pick("status"),
    service: pick("service"),
    assignee: pick("assignee"),
    from: pick("from"),
    to: pick("to"),
    emailFailed: pick("emailFailed"),
  });

  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel opens UTF-8 correctly.
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="humsols-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
