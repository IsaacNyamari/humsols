import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "@/auth";
import { can, type Actor, type Permission } from "@/lib/permissions";
import { getActiveActor } from "@/lib/services/users";

/**
 * The signed-in admin, re-checked against the database on every request so a
 * deactivated user or a changed role takes effect immediately. Deduplicated
 * per request with React cache().
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  // Session decryption uses crypto; mark this as request-time work for prerendering.
  await connection();
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return getActiveActor(id);
});

/** For pages: redirect to login when signed out, to the no-access page when not allowed. */
export async function requireActor(permission?: Permission): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect("/admin/login");
  if (permission && !can(actor.role, permission)) redirect("/admin/no-access");
  return actor;
}

/** For server actions and route handlers: never redirects, returns null when not allowed. */
export async function actorFor(permission: Permission): Promise<Actor | null> {
  const actor = await getActor();
  return actor && can(actor.role, permission) ? actor : null;
}
