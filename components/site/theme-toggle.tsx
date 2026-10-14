"use client";

import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Toggles light/dark and remembers the choice. Until the visitor chooses, the
 * inline script in the root layout follows the system setting. Icons are
 * swapped with CSS so server and client markup always match.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-lg text-fg hover:bg-bg-soft",
        className,
      )}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      data-testid="theme-toggle"
    >
      <Icon name="moon" className="size-5 dark:hidden" />
      <Icon name="sun" className="hidden size-5 dark:block" />
    </button>
  );
}
