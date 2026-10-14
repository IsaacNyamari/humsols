"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
const DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
const KEY = "analytics-consent";

function load() {
  if (!SRC || document.getElementById("hs-analytics")) return;
  const s = document.createElement("script");
  s.id = "hs-analytics";
  s.defer = true;
  s.src = SRC;
  if (DOMAIN) s.dataset.domain = DOMAIN;
  document.head.appendChild(s);
}

/** Optional analytics: disabled unless NEXT_PUBLIC_ANALYTICS_SRC is set, and only after consent. */
export function AnalyticsConsent() {
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (!SRC) return;
    let choice: string | null = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch {}
    if (choice === "granted") load();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only storage after mount
    else if (choice === null) setAsk(true);
  }, []);

  if (!SRC || !ask) return null;

  function decide(value: "granted" | "denied") {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    if (value === "granted") load();
    setAsk(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-xl lg:bottom-4"
    >
      <p className="text-sm">
        May we count anonymous page visits to improve this site? No advertising cookies. See our{" "}
        <Link href="/privacy" className="font-semibold text-primary underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => decide("granted")}>
          Allow
        </Button>
        <Button size="sm" variant="outline" onClick={() => decide("denied")}>
          Decline
        </Button>
      </div>
    </div>
  );
}
