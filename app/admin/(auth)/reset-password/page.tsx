import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage(props: PageProps<"/admin/reset-password">) {
  return (
    <>
      <h1 className="mb-6 text-xl">Set a new password</h1>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <WithToken searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function WithToken({
  searchParams,
}: {
  searchParams: PageProps<"/admin/reset-password">["searchParams"];
}) {
  const { token } = await searchParams;
  if (typeof token !== "string" || token.length < 20) {
    return (
      <p className="text-sm">
        This link is invalid.{" "}
        <Link href="/admin/forgot-password" className="font-semibold text-primary underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }
  return <ResetPasswordForm token={token} />;
}
