import { connectDB } from "@/lib/db";
import type { Actor } from "@/lib/permissions";
import { AuditLog } from "@/models";

/** Record a create/update/delete. Never throws: auditing must not break the action. */
export async function writeAudit(
  actor: Actor | null,
  action: string,
  entity: string,
  entityId?: string,
  changes?: Record<string, unknown>,
) {
  try {
    await connectDB();
    await AuditLog.create({
      user: actor?.id,
      userName: actor ? `${actor.name} <${actor.email}>` : "system",
      action,
      entity,
      entityId,
      changes: changes ? redact(changes) : undefined,
      at: new Date(),
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err);
  }
}

function redact(changes: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(changes)) {
    out[k] = /password|token|secret/i.test(k) ? "[redacted]" : v;
  }
  return out;
}

/** Shallow diff of top-level fields, used for audit "changes". */
export function diff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    const a = JSON.stringify(before[key] ?? null);
    const b = JSON.stringify(after[key] ?? null);
    if (a !== b) changes[key] = { from: before[key] ?? null, to: after[key] ?? null };
  }
  return changes;
}
