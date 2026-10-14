"use server";

import { revalidatePath } from "next/cache";
import { actorFor } from "@/lib/auth/session";
import type { Role } from "@/lib/constants";
import { changeUserRole, inviteUser, setUserActive } from "@/lib/services/users";

const denied = { ok: false as const, error: "You do not have permission to do that." };

function message(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export async function inviteUserAction(input: { name: string; email: string; role: Role }) {
  const actor = await actorFor("users:manage");
  if (!actor) return denied;
  try {
    const result = await inviteUser(actor, input);
    revalidatePath("/admin/users");
    return result;
  } catch (err) {
    return { ok: false as const, error: message(err) };
  }
}

export async function changeRoleAction(id: string, role: Role) {
  const actor = await actorFor("users:manage");
  if (!actor) return denied;
  try {
    await changeUserRole(actor, id, role);
  } catch (err) {
    return { ok: false as const, error: message(err) };
  }
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function setActiveAction(id: string, active: boolean) {
  const actor = await actorFor("users:manage");
  if (!actor) return denied;
  try {
    await setUserActive(actor, id, active);
  } catch (err) {
    return { ok: false as const, error: message(err) };
  }
  revalidatePath("/admin/users");
  return { ok: true as const };
}
