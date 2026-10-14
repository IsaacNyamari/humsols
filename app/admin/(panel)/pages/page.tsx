import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/page-title";
import { Icon } from "@/components/icons";
import { requireActor } from "@/lib/auth/session";
import { PAGE_KEYS, PAGES } from "@/lib/page-content/registry";

export const metadata: Metadata = { title: "Page text" };

export default async function PagesIndex() {
  await requireActor("content:write");
  return (
    <>
      <AdminPageTitle
        title="Page text"
        description="Headings, introductions and other fixed text on each page. Services, projects, packages, team, blog, jobs, FAQs and contact details have their own sections."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAGE_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={`/admin/pages/${key}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/50"
            >
              <span>
                <span className="block font-semibold">{PAGES[key].label}</span>
                <span className="text-xs text-muted">{PAGES[key].path}</span>
              </span>
              <Icon name="edit" className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
