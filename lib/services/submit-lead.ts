import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, leadSubmissionSchema } from "@/lib/validation/lead";
import { createLead } from "./leads";

export type SubmitResult =
  | { status: 201; body: { ok: true; reference: string; id: string } }
  | { status: 400; body: { ok: false; error: string; fieldErrors?: Record<string, string> } }
  | { status: 429; body: { ok: false; error: string }; retryAfterSeconds: number };

/**
 * Validate, spam-check and save a public form submission. Pure of HTTP concerns
 * so it can be unit tested; the route handler sends emails afterwards.
 */
export async function submitLead(
  body: unknown,
  meta: { ip: string; userAgent?: string },
): Promise<SubmitResult> {
  const limited = rateLimit(`lead:${meta.ip}`);
  if (!limited.ok) {
    return {
      status: 429,
      body: { ok: false, error: "Too many submissions. Please wait a few minutes or call us." },
      retryAfterSeconds: limited.retryAfterSeconds,
    };
  }

  // Honeypot: the hidden "website" field is invisible to people. Anything in it means a bot.
  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    String((body as { website?: unknown }).website ?? "").trim()
  ) {
    return { status: 400, body: { ok: false, error: "Your submission could not be accepted." } };
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: fieldErrors(parsed.error),
      },
    };
  }

  const { id, reference } = await createLead(parsed.data, meta);
  return { status: 201, body: { ok: true, reference, id } };
}
