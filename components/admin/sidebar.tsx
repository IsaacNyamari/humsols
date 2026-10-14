"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions/auth";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { Role } from "@/lib/constants";
import { can, type Permission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: string; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", permission: "dashboard:view" },
  { href: "/admin/leads", label: "Leads", icon: "inbox", permission: "leads:read" },
  { href: "/admin/pages", label: "Page text", icon: "edit", permission: "content:write" },
  { href: "/admin/content/services", label: "Services", icon: "app", permission: "content:write" },
  {
    href: "/admin/content/projects",
    label: "Projects",
    icon: "briefcase",
    permission: "content:write",
  },
  {
    href: "/admin/content/packages",
    label: "Internet packages",
    icon: "wifi",
    permission: "content:write",
  },
  {
    href: "/admin/content/testimonials",
    label: "Testimonials",
    icon: "star",
    permission: "content:write",
  },
  { href: "/admin/content/team", label: "Team", icon: "users", permission: "content:write" },
  { href: "/admin/content/posts", label: "Blog posts", icon: "file", permission: "content:write" },
  { href: "/admin/content/jobs", label: "Jobs", icon: "briefcase", permission: "content:write" },
  { href: "/admin/content/faqs", label: "FAQs", icon: "check", permission: "content:write" },
  { href: "/admin/settings", label: "Settings", icon: "settings", permission: "settings:write" },
  { href: "/admin/users", label: "Users", icon: "users", permission: "users:manage" },
  { href: "/admin/audit", label: "Audit log", icon: "history", permission: "audit:read" },
];

export function AdminSidebar({ user }: { user: { name: string; email: string; role: Role } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => can(user.role, n.permission));
  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo href="/admin" className="h-7" />
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-bg-soft"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh",
          open ? "flex" : "hidden",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/admin" className="h-7" />
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-bg-soft lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {items.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold",
                    active(n.href) ? "bg-primary/10 text-primary" : "text-fg hover:bg-bg-soft",
                  )}
                >
                  <Icon name={n.icon} className="size-4" /> {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">
            {user.email} · <span className="capitalize">{user.role}</span>
          </p>
          <div className="mt-3 flex items-center gap-1">
            <Link
              href="/admin/account"
              className="rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-bg-soft"
            >
              Account
            </Link>
            <Link
              href="/"
              className="rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-bg-soft"
              target="_blank"
            >
              View site
            </Link>
            <ThemeToggle className="ml-auto size-8" />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-bg-soft"
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}
    </>
  );
}
