"use server";

import { revalidatePath, updateTag } from "next/cache";
import { actorFor } from "@/lib/auth/session";
import { TAGS } from "@/lib/constants";
import { writeAudit } from "@/lib/services/audit";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/settings";
import { settingsInput } from "@/lib/validation/content";
import { fieldErrors } from "@/lib/validation/lead";

/** Rebuild /sitemap.xml (and page metadata) from the current published content. */
export async function refreshSitemapAction() {
  const actor = await actorFor("content:write");
  if (!actor) return { ok: false as const, error: "You do not have permission to do that." };
  for (const tag of [TAGS.services, TAGS.projects, TAGS.posts, TAGS.pages, TAGS.settings])
    updateTag(tag);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/seo");
  await writeAudit(actor, "refresh", "Sitemap");
  return { ok: true as const };
}

export async function saveVerificationAction(input: { google: string; bing: string }) {
  const actor = await actorFor("settings:write");
  if (!actor)
    return { ok: false as const, error: "Only owners and admins can change verification codes." };
  const current = await getSiteSettings();
  const parsed = settingsInput.safeParse({ ...current, verification: input });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return {
      ok: false as const,
      error:
        errors["verification.google"] ?? errors["verification.bing"] ?? "Please check the codes.",
      fieldErrors: errors,
    };
  }
  await updateSiteSettings(actor, parsed.data);
  updateTag(TAGS.settings);
  revalidatePath("/admin/seo");
  return { ok: true as const, verification: parsed.data.verification };
}
