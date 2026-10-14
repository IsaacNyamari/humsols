import type { Model } from "mongoose";
import type { z } from "zod";
import { connectDB } from "@/lib/db";
import { TAGS } from "@/lib/constants";
import { assertCan, type Actor } from "@/lib/permissions";
import { toPlain } from "@/lib/utils";
import {
  faqInput,
  jobInput,
  packageInput,
  postInput,
  projectInput,
  serviceInput,
  teamInput,
  testimonialInput,
} from "@/lib/validation/content";
import { fieldErrors } from "@/lib/validation/lead";
import {
  Faq,
  InternetPackage,
  Job,
  Post,
  Project,
  Service,
  TeamMember,
  Testimonial,
} from "@/models";
import { diff, writeAudit } from "./audit";

type PublishField = { field: string; on: unknown; off: unknown };

type Entry = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  schema: z.ZodType;
  tag: string;
  sort: Record<string, 1 | -1>;
  titleField: string;
  publish: PublishField;
  ordered: boolean;
  /** Public paths that show this content (for revalidatePath). */
  paths: string[];
};

export const CONTENT = {
  services: {
    label: "Service",
    model: Service,
    schema: serviceInput,
    tag: TAGS.services,
    sort: { order: 1 },
    titleField: "title",
    publish: { field: "published", on: true, off: false },
    ordered: true,
    paths: ["/", "/services", "/services/[slug]", "/cctv", "/internet"],
  },
  projects: {
    label: "Project",
    model: Project,
    schema: projectInput,
    tag: TAGS.projects,
    sort: { order: 1, createdAt: -1 },
    titleField: "title",
    publish: { field: "published", on: true, off: false },
    ordered: true,
    paths: ["/", "/portfolio", "/portfolio/[slug]", "/services/[slug]"],
  },
  packages: {
    label: "Internet package",
    model: InternetPackage,
    schema: packageInput,
    tag: TAGS.packages,
    sort: { audience: 1, order: 1 },
    titleField: "name",
    publish: { field: "active", on: true, off: false },
    ordered: true,
    paths: ["/", "/internet"],
  },
  testimonials: {
    label: "Testimonial",
    model: Testimonial,
    schema: testimonialInput,
    tag: TAGS.testimonials,
    sort: { order: 1 },
    titleField: "name",
    publish: { field: "published", on: true, off: false },
    ordered: true,
    paths: ["/"],
  },
  team: {
    label: "Team member",
    model: TeamMember,
    schema: teamInput,
    tag: TAGS.team,
    sort: { order: 1 },
    titleField: "name",
    publish: { field: "published", on: true, off: false },
    ordered: true,
    paths: ["/about"],
  },
  posts: {
    label: "Blog post",
    model: Post,
    schema: postInput,
    tag: TAGS.posts,
    sort: { createdAt: -1 },
    titleField: "title",
    publish: { field: "status", on: "published", off: "draft" },
    ordered: false,
    paths: ["/blog", "/blog/[slug]"],
  },
  jobs: {
    label: "Job",
    model: Job,
    schema: jobInput,
    tag: TAGS.jobs,
    sort: { createdAt: -1 },
    titleField: "title",
    publish: { field: "open", on: true, off: false },
    ordered: false,
    paths: ["/careers"],
  },
  faqs: {
    label: "FAQ",
    model: Faq,
    schema: faqInput,
    tag: TAGS.faqs,
    sort: { category: 1, order: 1 },
    titleField: "question",
    publish: { field: "published", on: true, off: false },
    ordered: true,
    paths: ["/", "/services/[slug]", "/internet"],
  },
} satisfies Record<string, Entry>;

export type ContentKind = keyof typeof CONTENT;
export const CONTENT_KINDS = Object.keys(CONTENT) as ContentKind[];

export function isContentKind(value: string): value is ContentKind {
  return value in CONTENT;
}

export type ContentDoc = Record<string, unknown> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export type MutationResult =
  { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function entry(kind: ContentKind): Entry {
  return CONTENT[kind];
}

function plain(doc: unknown): ContentDoc {
  const { _id, ...rest } = toPlain<Record<string, unknown> & { _id: string }>(doc);
  return { ...rest, id: _id } as ContentDoc;
}

export function isPublished(kind: ContentKind, doc: Record<string, unknown>) {
  const p = entry(kind).publish;
  return doc[p.field] === p.on;
}

export async function listContent(actor: Actor, kind: ContentKind) {
  assertCan(actor, "content:write");
  await connectDB();
  const e = entry(kind);
  const docs = await e.model.find({}).sort(e.sort).lean();
  return docs.map(plain);
}

export async function getContent(actor: Actor, kind: ContentKind, id: string) {
  assertCan(actor, "content:write");
  await connectDB();
  const doc = await entry(kind)
    .model.findById(id)
    .lean()
    .catch(() => null);
  return doc ? plain(doc) : null;
}

function prepare(
  kind: ContentKind,
  data: Record<string, unknown>,
  actor: Actor,
  existing?: Record<string, unknown>,
) {
  const out: Record<string, unknown> = { ...data };
  if (kind === "posts") {
    if (out.publishedAt) out.publishedAt = new Date(String(out.publishedAt));
    if (out.status === "published" && !out.publishedAt)
      out.publishedAt = existing?.publishedAt ?? new Date();
    if (!existing) out.author = actor.id;
  }
  // Empty optional images are stored as "unset" rather than null.
  for (const key of ["heroImage", "photo", "coverImage"])
    if (out[key] === null) out[key] = undefined;
  return out;
}

const SLUG_TAKEN = {
  ok: false as const,
  error: "That slug is already used.",
  fieldErrors: { slug: "Already used — choose another" },
};

/** Explicit check (the unique index is the backstop for races). */
async function slugTaken(kind: ContentKind, data: Record<string, unknown>, exceptId?: string) {
  if (typeof data.slug !== "string") return false;
  const filter: Record<string, unknown> = { slug: data.slug };
  if (exceptId) filter._id = { $ne: exceptId };
  return Boolean(await entry(kind).model.exists(filter));
}

function duplicateKey(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export async function createContent(
  actor: Actor,
  kind: ContentKind,
  input: unknown,
): Promise<MutationResult> {
  assertCan(actor, "content:write");
  const e = entry(kind);
  const parsed = e.schema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  await connectDB();
  if (await slugTaken(kind, parsed.data as Record<string, unknown>)) return SLUG_TAKEN;
  try {
    const data = prepare(kind, parsed.data as Record<string, unknown>, actor);
    const doc = await e.model.create(data);
    const id = String(doc._id);
    await writeAudit(actor, "create", e.label, id, { [e.titleField]: data[e.titleField] });
    return { ok: true, id };
  } catch (err) {
    if (duplicateKey(err)) return SLUG_TAKEN;
    throw err;
  }
}

export async function updateContent(
  actor: Actor,
  kind: ContentKind,
  id: string,
  input: unknown,
): Promise<MutationResult> {
  assertCan(actor, "content:write");
  const e = entry(kind);
  const parsed = e.schema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  await connectDB();
  const before = await e.model
    .findById(id)
    .lean()
    .catch(() => null);
  if (!before) return { ok: false, error: `${e.label} not found.` };
  if (await slugTaken(kind, parsed.data as Record<string, unknown>, id)) return SLUG_TAKEN;
  try {
    const data = prepare(
      kind,
      parsed.data as Record<string, unknown>,
      actor,
      before as Record<string, unknown>,
    );
    const unset = Object.fromEntries(
      Object.entries(data)
        .filter(([, v]) => v === undefined)
        .map(([k]) => [k, 1]),
    );
    const set = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    await e.model.updateOne(
      { _id: id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { runValidators: true },
    );
    await writeAudit(actor, "update", e.label, id, diff(toPlain(before), toPlain(set)));
    return { ok: true, id };
  } catch (err) {
    if (duplicateKey(err)) return SLUG_TAKEN;
    throw err;
  }
}

export async function setContentPublished(
  actor: Actor,
  kind: ContentKind,
  id: string,
  published: boolean,
) {
  assertCan(actor, "content:write");
  const e = entry(kind);
  await connectDB();
  const set: Record<string, unknown> = {
    [e.publish.field]: published ? e.publish.on : e.publish.off,
  };
  if (kind === "posts" && published) {
    const existing = await Post.findById(id, { publishedAt: 1 }).lean();
    if (!existing?.publishedAt) set.publishedAt = new Date();
  }
  const res = await e.model.updateOne({ _id: id }, { $set: set });
  if (!res.matchedCount) throw new Error(`${e.label} not found`);
  await writeAudit(actor, published ? "publish" : "unpublish", e.label, id, set);
}

export async function moveContent(
  actor: Actor,
  kind: ContentKind,
  id: string,
  direction: "up" | "down",
) {
  assertCan(actor, "content:write");
  const e = entry(kind);
  if (!e.ordered) return;
  await connectDB();
  const docs = await e.model.find({}, { _id: 1, order: 1 }).sort(e.sort).lean();
  const index = docs.findIndex((d) => String(d._id) === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= docs.length) return;
  // Renumber everything so ties never get stuck.
  const ids = docs.map((d) => String(d._id));
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  await e.model.bulkWrite(
    ids.map((docId, i) => ({
      updateOne: { filter: { _id: docId }, update: { $set: { order: (i + 1) * 10 } } },
    })),
  );
  await writeAudit(actor, "reorder", e.label, id, { direction });
}

export async function deleteContent(actor: Actor, kind: ContentKind, id: string) {
  assertCan(actor, "content:write");
  const e = entry(kind);
  await connectDB();
  const before = await e.model
    .findById(id)
    .lean()
    .catch(() => null);
  if (!before) return;
  await e.model.deleteOne({ _id: id });
  if (kind === "services") await Project.updateMany({ services: id }, { $pull: { services: id } });
  await writeAudit(actor, "delete", e.label, id, {
    [e.titleField]: (before as Record<string, unknown>)[e.titleField],
  });
}
