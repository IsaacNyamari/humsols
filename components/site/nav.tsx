"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export type NavService = { slug: string; title: string; summary: string; icon: string };

const links = [
  { href: "/products/hs-water-billing", label: "HS Water Billing" },
  { href: "/internet", label: "Internet" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav({ services }: { services: NavService[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const close = () => {
    setMegaOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
        <div ref={megaRef} className="relative">
          <button
            type="button"
            aria-expanded={megaOpen}
            aria-controls="services-menu"
            onClick={() => setMegaOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-bg-soft"
          >
            Services{" "}
            <Icon
              name="chevronDown"
              className={cn("size-4 transition-transform", megaOpen && "rotate-180")}
            />
          </button>
          <div
            id="services-menu"
            hidden={!megaOpen}
            className="absolute left-0 top-full z-50 mt-2 w-[44rem] rounded-2xl border border-border bg-card p-4 shadow-xl"
          >
            <ul className="grid grid-cols-2 gap-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    onClick={close}
                    className="flex gap-3 rounded-xl p-3 hover:bg-bg-soft"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={s.icon} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{s.title}</span>
                      <span className="line-clamp-2 text-xs text-muted">{s.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-bg-soft px-4 py-3 text-sm">
              <span className="text-muted">Not sure what you need?</span>
              <Link
                href="/services"
                onClick={close}
                className="font-semibold text-primary hover:underline"
              >
                All services →
              </Link>
            </div>
          </div>
        </div>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-bg-soft"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link href="/quote" className={buttonClass({ size: "sm" }, "hidden sm:inline-flex")}>
          Get a quote
        </Link>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-bg-soft lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Icon name={mobileOpen ? "close" : "menu"} className="size-6" />
        </button>
      </div>

      {/* Mobile */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-border bg-bg px-4 pb-24 pt-4 lg:hidden"
      >
        <nav aria-label="Mobile">
          <p className="px-2 pb-2 text-xs font-bold tracking-wider text-muted uppercase">
            Services
          </p>
          <ul className="mb-4 space-y-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 font-semibold hover:bg-bg-soft"
                >
                  <Icon name={s.icon} className="size-5 text-primary" /> {s.title}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 border-t border-border pt-4">
            {[
              { href: "/services", label: "All services" },
              ...links,
              { href: "/blog", label: "Blog" },
              { href: "/careers", label: "Careers" },
              { href: "/support", label: "Customer support" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={close}
                  className="block rounded-lg px-2 py-2.5 font-semibold hover:bg-bg-soft"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/quote"
            onClick={close}
            className={buttonClass({ size: "lg" }, "mt-6 w-full")}
          >
            Get a quote
          </Link>
        </nav>
      </div>
    </>
  );
}
