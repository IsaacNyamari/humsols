import { connectDB } from "@/lib/db";
import { PAGES, pageSchema, type PageCopy, type PageKey } from "@/lib/page-content/registry";
import { assertCan, type Actor } from "@/lib/permissions";
import { toPlain } from "@/lib/utils";
import { fieldErrors } from "@/lib/validation/lead";
import { PageContent } from "@/models";
import { diff, writeAudit } from "./audit";

/** Saved copy merged over the defaults, so new fields always have text. */
export async function readPageCopy<K extends PageKey>(key: K): Promise<PageCopy<K>> {
  await connectDB();
  const doc = await PageContent.findOne({ key }).lean();
  const saved = doc ? toPlain<Record<string, unknown>>(doc.data ?? {}) : {};
  const defaults = PAGES[key].defaults as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...defaults };
  for (const k of Object.keys(defaults))
    if (saved[k] !== undefined && saved[k] !== null) merged[k] = saved[k];
  return merged as PageCopy<K>;
}

export async function updatePageCopy(actor: Actor, key: PageKey, input: unknown) {
  assertCan(actor, "content:write");
  const parsed = pageSchema(key).safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  const before = await readPageCopy(key);
  await PageContent.updateOne({ key }, { $set: { data: parsed.data } }, { upsert: true });
  await writeAudit(
    actor,
    "update",
    "PageText",
    key,
    diff(before as Record<string, unknown>, parsed.data),
  );
  return { ok: true as const, id: key };
}

export async function resetPageCopy(actor: Actor, key: PageKey) {
  assertCan(actor, "content:write");
  await connectDB();
  await PageContent.deleteOne({ key });
  await writeAudit(actor, "reset", "PageText", key);
}
