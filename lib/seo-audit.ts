// SEO checks for Admin › SEO: what Google shows for each public page.

export type SeoLevel = "ok" | "warn" | "error";
export type SeoRow = {
  path: string;
  title: string;
  description: string;
  issues: string[];
  level: SeoLevel;
  editHref?: string;
};

const TITLE_MAX = 60;
const TITLE_MIN = 15;
const DESC_MIN = 70;
const DESC_MAX = 160;

/** Check one page's title (as Google shows it) and description. */
export function auditPage(page: {
  path: string;
  title: string;
  description: string;
  editHref?: string;
}): SeoRow {
  const title = page.title.trim();
  const description = page.description.trim();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!title) errors.push("Missing title");
  else if (title.length > TITLE_MAX)
    warnings.push(`Title is long (${title.length} characters; aim for under ${TITLE_MAX})`);
  else if (title.length < TITLE_MIN) warnings.push(`Title is short (${title.length} characters)`);

  if (!description) errors.push("Missing description");
  else if (description.length < DESC_MIN)
    warnings.push(
      `Description is short (${description.length} characters; aim for ${DESC_MIN}–${DESC_MAX})`,
    );
  else if (description.length > DESC_MAX)
    warnings.push(
      `Description is long (${description.length} characters; Google cuts it at about ${DESC_MAX})`,
    );

  if (/\[PLACEHOLDER/i.test(title) || /\[PLACEHOLDER/i.test(description))
    errors.push("Contains placeholder text");

  const issues = [...errors, ...warnings];
  return {
    ...page,
    title,
    description,
    issues,
    level: errors.length ? "error" : warnings.length ? "warn" : "ok",
  };
}

/** Titles of inner pages get the site-wide " | HumSols" suffix from the root layout. */
export const withSuffix = (title: string) => (title ? `${title} | HumSols` : "");
