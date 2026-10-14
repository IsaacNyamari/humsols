import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Forgotten password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-xl">Forgotten password</h1>
      <p className="mb-6 text-sm text-muted">
        Enter your admin email and we&apos;ll send you a link to set a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
