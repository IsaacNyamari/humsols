import type { Role } from "@/lib/constants";

export const PERMISSIONS = {
  "dashboard:view": ["owner", "admin", "editor", "sales"],
  "leads:read": ["owner", "admin", "sales"],
  "leads:write": ["owner", "admin", "sales"],
  "content:write": ["owner", "admin", "editor"],
  "settings:write": ["owner", "admin"],
  "users:manage": ["owner", "admin"],
  "audit:read": ["owner", "admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

/** The authenticated admin performing an action. */
export type Actor = { id: string; name: string; email: string; role: Role };

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(
  actor: Actor | null | undefined,
  permission: Permission,
): asserts actor is Actor {
  if (!actor || !can(actor.role, permission)) throw new ForbiddenError();
}

/** Only an owner may create, change or deactivate another owner. */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole !== "owner";
  return false;
}
