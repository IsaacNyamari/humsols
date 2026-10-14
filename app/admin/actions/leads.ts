"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actorFor } from "@/lib/auth/session";
import type { LeadStatus } from "@/lib/constants";
import { sendLeadEmails } from "@/lib/mail/lead-emails";
import { addLeadNote, assignLead, deleteLead, updateLeadStatus } from "@/lib/services/leads";

export type ActionResult = { ok: boolean; error?: string };

async function run(
  permission: "leads:write" | "settings:write",
  fn: (actor: NonNullable<Awaited<ReturnType<typeof actorFor>>>) => Promise<void>,
  id: string,
): Promise<ActionResult> {
  const actor = await actorFor(permission);
  if (!actor) return { ok: false, error: "You do not have permission to do that." };
  try {
    await fn(actor);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setLeadStatusAction(id: string, status: LeadStatus) {
  return run("leads:write", (actor) => updateLeadStatus(actor, id, status), id);
}

export async function assignLeadAction(id: string, userId: string) {
  return run("leads:write", (actor) => assignLead(actor, id, userId || null), id);
}

export async function addLeadNoteAction(id: string, text: string) {
  return run("leads:write", (actor) => addLeadNote(actor, id, text), id);
}

export async function resendLeadEmailsAction(id: string) {
  return run("leads:write", async () => void (await sendLeadEmails(id)), id);
}

export async function deleteLeadAction(id: string) {
  const result = await run("settings:write", (actor) => deleteLead(actor, id), id);
  if (result.ok) redirect("/admin/leads");
  return result;
}
