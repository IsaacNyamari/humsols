import { getPageCopy, getPosts, getProjects, getServices } from "@/lib/data/public";
import { PAGE_KEYS, PAGES, type PageKey } from "@/lib/page-content/registry";
import { auditPage, withSuffix, type SeoRow } from "@/lib/seo-audit";

/** Every public page with the title/description Google will see, checked. */
export async function seoReport(): Promise<SeoRow[]> {
  const pageKeys = PAGE_KEYS.filter((k) => PAGES[k].fields.some((f) => f.name === "seoTitle"));
  const [copies, services, projects, posts] = await Promise.all([
    Promise.all(pageKeys.map((k) => getPageCopy(k as PageKey))),
    getServices(),
    getProjects(),
    getPosts(),
  ]);

  const rows: SeoRow[] = pageKeys.map((key, i) => {
    const copy = copies[i] as Record<string, unknown>;
    const title = String(copy.seoTitle ?? "");
    return auditPage({
      path: PAGES[key].path,
      title: key === "home" ? title : withSuffix(title),
      description: String(copy.seoDescription ?? ""),
      editHref: `/admin/pages/${key}`,
    });
  });

  for (const s of services) {
    rows.push(
      auditPage({
        path: `/services/${s.slug}`,
        title: withSuffix(s.seo?.title || s.title),
        description: s.seo?.description || s.summary,
        editHref: `/admin/content/services/${s.id}`,
      }),
    );
  }
  for (const p of projects) {
    rows.push(
      auditPage({
        path: `/portfolio/${p.slug}`,
        title: withSuffix(p.title),
        description: p.summary,
        editHref: `/admin/content/projects/${p.id}`,
      }),
    );
  }
  for (const p of posts) {
    rows.push(
      auditPage({
        path: `/blog/${p.slug}`,
        title: withSuffix(p.title),
        description: p.excerpt,
        editHref: `/admin/content/posts/${p.id}`,
      }),
    );
  }

  const order = { error: 0, warn: 1, ok: 2 } as const;
  return rows.sort((a, b) => order[a.level] - order[b.level] || a.path.localeCompare(b.path));
}
