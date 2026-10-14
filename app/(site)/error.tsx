"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/button";

export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl">Sorry, this page didn&apos;t load</h1>
      <p className="mt-4 max-w-md text-muted">
        Please try again. If it keeps happening, call us on +254 725 742 737 or email
        info@humsols.com.
        {error.digest ? (
          <span className="mt-2 block text-xs">Reference: {error.digest}</span>
        ) : null}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className={buttonClass({ variant: "outline" })}>
          Home
        </Link>
      </div>
    </div>
  );
}
