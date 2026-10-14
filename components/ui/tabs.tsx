"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** WAI-ARIA tabs with arrow-key navigation. */
export function Tabs({
  tabs,
  initial = 0,
}: {
  tabs: { label: string; content: ReactNode }[];
  initial?: number;
}) {
  const [active, setActive] = useState(initial);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        className="inline-flex rounded-xl border border-border bg-bg-soft p-1"
        onKeyDown={onKey}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active === i ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          className="mt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
