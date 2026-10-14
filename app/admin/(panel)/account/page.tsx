import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/admin/auth-forms";
import { AdminPageTitle } from "@/components/admin/page-title";
import { requireActor } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const actor = await requireActor();
  return (
    <>
      <AdminPageTitle
        title="Your account"
        description={`${actor.name} · ${actor.email} · ${actor.role}`}
      />
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg">Change password</h2>
        <ChangePasswordForm />
      </div>
    </>
  );
}
