import { after } from "next/server";
import { sendLeadEmails } from "@/lib/mail/lead-emails";
import { clientIp } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { submitLead } from "@/lib/services/submit-lead";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const result = await submitLead(body, {
    ip: clientIp(request.headers),
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  if (result.status === 429) {
    return Response.json(result.body, {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    });
  }

  if (result.status === 201) {
    // Send emails after the response so the visitor isn't kept waiting.
    const id = result.body.id;
    after(() =>
      sendLeadEmails(id).catch((err) => console.error("[mail] lead email job failed", err)),
    );
    return Response.json({ ok: true, reference: result.body.reference }, { status: 201 });
  }

  return Response.json(result.body, { status: result.status });
}
