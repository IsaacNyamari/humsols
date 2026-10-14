import Link from "next/link";
import { getServices, getSettings } from "@/lib/data/public";
import { Logo } from "./logo";
import { Nav } from "./nav";

export async function Header() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const announcement = settings.announcement;

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-primary px-4 py-2 text-primary-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      {announcement.active && announcement.text ? (
        <div className="bg-navy px-4 py-2 text-center text-sm text-white">
          {announcement.href ? (
            <Link
              href={announcement.href}
              className="font-medium underline-offset-4 hover:underline"
            >
              {announcement.text} <span className="text-aqua">→</span>
            </Link>
          ) : (
            announcement.text
          )}
        </div>
      ) : null}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <Nav
            services={services.map((s) => ({
              slug: s.slug,
              title: s.title,
              summary: s.summary,
              icon: s.icon,
            }))}
          />
        </div>
      </header>
    </>
  );
}
