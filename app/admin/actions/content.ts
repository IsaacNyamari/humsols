"use server";

import { revalidatePath, updateTag } from "next/cache";
import { actorFor } from "@/lib/auth/session";
import { TAGS } from "@/lib/constants";
import {
  CONTENT,
  createContent,
  deleteContent,
  isContentKind,
  moveContent,
  setContentPublished,
  updateContent,
  type ContentKind,
  type MutationResult,
} from "@/lib/services/content";
import { isPageKey } from "@/lib/page-content/registry";
import { resetPageCopy, updatePageCopy } from "@/lib/services/page-content";
import { updateSiteSettings } from "@/lib/services/settings";
import { settingsInput } from "@/lib/validation/content";
import { fieldErrors } from "@/lib/validation/lead";

/** Expire public caches for a content type so the change shows immediately. */
function refresh(kind: ContentKind) {
  updateTag(CONTENT[kind].tag);
  // Projects embed service titles, so a service change also refreshes projects.
  if (kind === "services") updateTag(TAGS.projects);
  revalidatePath(`/admin/content/${kind}`);
}

const denied = { ok: false as const, error: "You do not have permission to do that." };

export async function saveContentAction(
  kind: string,
  id: string | null,
  json: string,
): Promise<MutationResult> {
  if (!isContentKind(kind)) return { ok: false, error: "Unknown content type." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  let input: unknown;
  try {
    input = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid form data." };
  }
  const result = id
    ? await updateContent(actor, kind, id, input)
    : await createContent(actor, kind, input);
  if (result.ok) refresh(kind);
  return result;
}

export async function setPublishedAction(kind: string, id: string, published: boolean) {
  if (!isContentKind(kind)) return { ok: false, error: "Unknown content type." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  try {
    await setContentPublished(actor, kind, id, published);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed" };
  }
  refresh(kind);
  return { ok: true };
}

export async function moveContentAction(kind: string, id: string, direction: "up" | "down") {
  if (!isContentKind(kind)) return { ok: false, error: "Unknown content type." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  await moveContent(actor, kind, id, direction);
  refresh(kind);
  return { ok: true };
}

export async function deleteContentAction(kind: string, id: string) {
  if (!isContentKind(kind)) return { ok: false, error: "Unknown content type." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  await deleteContent(actor, kind, id);
  refresh(kind);
  return { ok: true };
}

export async function saveSettingsAction(json: string): Promise<MutationResult> {
  const actor = await actorFor("settings:write");
  if (!actor) return denied;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid form data." };
  }
  const parsed = settingsInput.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  await updateSiteSettings(actor, parsed.data);
  updateTag(TAGS.settings);
  revalidatePath("/admin/settings");
  return { ok: true, id: "site" };
}

export async function savePageCopyAction(key: string, json: string): Promise<MutationResult> {
  if (!isPageKey(key)) return { ok: false, error: "Unknown page." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  let input: unknown;
  try {
    input = JSON.parse(json);
  } catch {
    return { ok: false, error: "Invalid form data." };
  }
  const result = await updatePageCopy(actor, key, input);
  if (result.ok) {
    updateTag(TAGS.pages);
    revalidatePath(`/admin/pages/${key}`);
  }
  return result;
}

export async function resetPageCopyAction(key: string) {
  if (!isPageKey(key)) return { ok: false, error: "Unknown page." };
  const actor = await actorFor("content:write");
  if (!actor) return denied;
  await resetPageCopy(actor, key);
  updateTag(TAGS.pages);
  revalidatePath(`/admin/pages/${key}`);
  return { ok: true };
}
