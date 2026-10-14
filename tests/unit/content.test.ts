import { describe, expect, it } from "vitest";
import { queryPackages, queryPost, queryServices, queryService } from "@/lib/queries/public";
import {
  createContent,
  moveContent,
  setContentPublished,
  updateContent,
} from "@/lib/services/content";
import { readPageCopy, resetPageCopy, updatePageCopy } from "@/lib/services/page-content";
import { PAGES } from "@/lib/page-content/registry";
import { AuditLog } from "@/models";
import { actor } from "./helpers";

const editor = actor("editor");
const svc = (slug: string, published = false) => ({
  slug,
  title: `Service ${slug}`,
  summary: "Summary text for tests.",
  published,
});

describe("publishing controls public visibility", () => {
  it("hides unpublished services and shows them once published", async () => {
    const created = await createContent(editor, "services", svc("cctv-test"));
    if (!created.ok) throw new Error(created.error);
    expect(await queryServices()).toHaveLength(0);
    expect(await queryService("cctv-test")).toBeNull();

    await setContentPublished(editor, "services", created.id, true);
    expect((await queryServices()).map((s) => s.slug)).toEqual(["cctv-test"]);

    await setContentPublished(editor, "services", created.id, false);
    expect(await queryService("cctv-test")).toBeNull();
  });

  it("uses each type's own publish field (packages: active, posts: status)", async () => {
    const pkg = await createContent(editor, "packages", {
      name: "Home 10",
      audience: "home",
      speedMbps: 10,
      priceKes: 2500,
      active: false,
    });
    const post = await createContent(editor, "posts", {
      slug: "hello",
      title: "Hello",
      status: "draft",
    });
    if (!pkg.ok || !post.ok) throw new Error("create failed");
    expect(await queryPackages()).toHaveLength(0);
    expect(await queryPost("hello")).toBeNull();

    await setContentPublished(editor, "packages", pkg.id, true);
    await setContentPublished(editor, "posts", post.id, true);
    expect(await queryPackages()).toHaveLength(1);
    const published = await queryPost("hello");
    expect(published?.publishedAt).toBeTruthy();
  });
});

describe("content editing", () => {
  it("validates input and rejects duplicate slugs", async () => {
    const bad = await createContent(editor, "services", {
      slug: "Bad Slug!",
      title: "",
      summary: "",
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok)
      expect(Object.keys(bad.fieldErrors ?? {})).toEqual(
        expect.arrayContaining(["slug", "title", "summary"]),
      );

    expect((await createContent(editor, "services", svc("dup"))).ok).toBe(true);
    const dup = await createContent(editor, "services", svc("dup"));
    expect(dup.ok).toBe(false);
    if (!dup.ok) expect(dup.fieldErrors?.slug).toBeTruthy();
  });

  it("requires alt text on images", async () => {
    const r = await createContent(editor, "team", {
      name: "Jane",
      photo: { url: "/uploads/2026/10/abcdef0123456789.png", alt: "" },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.["photo.alt"]).toMatch(/alt text/i);
  });

  it("writes an audit log entry for every change", async () => {
    const created = await createContent(editor, "faqs", { question: "Q?", answer: "A." });
    if (!created.ok) throw new Error(created.error);
    await updateContent(editor, "faqs", created.id, { question: "Q2?", answer: "A." });
    await setContentPublished(editor, "faqs", created.id, false);
    await moveContent(editor, "faqs", created.id, "up");
    const actions = (await AuditLog.find({ entityId: created.id }).sort({ at: 1 }).lean()).map(
      (a) => a.action,
    );
    expect(actions).toEqual(expect.arrayContaining(["create", "update", "unpublish"]));
    const update = await AuditLog.findOne({ entityId: created.id, action: "update" }).lean();
    expect(update?.changes).toMatchObject({ question: { from: "Q?", to: "Q2?" } });
  });
});

describe("page text", () => {
  it("falls back to defaults, saves edits and can be reset", async () => {
    expect((await readPageCopy("home")).heroTitle).toBe(PAGES.home.defaults.heroTitle);

    const edited = { ...PAGES.home.defaults, heroTitle: "Edited title" };
    const r = await updatePageCopy(editor, "home", edited);
    expect(r.ok).toBe(true);
    expect((await readPageCopy("home")).heroTitle).toBe("Edited title");

    await resetPageCopy(editor, "home");
    expect((await readPageCopy("home")).heroTitle).toBe(PAGES.home.defaults.heroTitle);
  });

  it("rejects invalid page text", async () => {
    const r = await updatePageCopy(editor, "home", {
      ...PAGES.home.defaults,
      reasons: [{ icon: "x", title: "", text: "" }],
    });
    expect(r.ok).toBe(false);
  });
});
