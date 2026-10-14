import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <div className="mx-auto max-w-md py-20 text-center" data-testid="no-access">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">403</p>
      <h1 className="mt-2 text-2xl">You don&apos;t have access to that page</h1>
      <p className="mt-3 text-muted">
        Your role doesn&apos;t include this area of the admin. Ask an owner or admin if you need
        access.
      </p>
      <Link href="/admin" className={buttonClass({}, "mt-6")}>
        Back to dashboard
      </Link>
    </div>
  );
}
