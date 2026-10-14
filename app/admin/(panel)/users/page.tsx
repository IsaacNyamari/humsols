import type { Metadata } from "next";
import { AdminPageTitle } from "@/components/admin/page-title";
import { UsersManager } from "@/components/admin/users-manager";
import { requireActor } from "@/lib/auth/session";
import { listUsers } from "@/lib/services/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const actor = await requireActor("users:manage");
  const users = await listUsers(actor);
  return (
    <>
      <AdminPageTitle
        title="Users"
        description="Who can sign in to the admin, and what they can do."
      />
      <UsersManager users={users} me={{ id: actor.id, role: actor.role }} />
    </>
  );
}
