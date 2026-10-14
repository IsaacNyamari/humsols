import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { ROLES, type Role } from "@/lib/constants";
import { layout } from "@/lib/mail/templates";
import { sendMail } from "@/lib/mail/transport";
import { assertCan, canManageRole, ForbiddenError, type Actor } from "@/lib/permissions";
import { toPlain } from "@/lib/utils";
import { changePasswordInput, inviteUserInput, resetPasswordInput } from "@/lib/validation/content";
import { fieldErrors } from "@/lib/validation/lead";
import { User } from "@/models";
import { writeAudit } from "./audit";

const BCRYPT_ROUNDS = 12;
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

function dto(doc: unknown): UserDTO {
  const d = toPlain<Record<string, unknown> & { _id: string }>(doc);
  return {
    id: d._id,
    name: d.name as string,
    email: d.email as string,
    role: d.role as Role,
    active: d.active as boolean,
    lastLoginAt: d.lastLoginAt as string | undefined,
    createdAt: d.createdAt as string,
  };
}

/** Used by the Auth.js credentials provider. Returns null on any failure. */
export async function verifyCredentials(email: string, password: string): Promise<Actor | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  const hash = user?.passwordHash ?? "$2b$12$ICBkUu4DL9uXwEKBbbHx0.4hv3jRyZdQ4oI3akubBZbR6W5eAE/Sq";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok || !user.active) return null;
  user.lastLoginAt = new Date();
  await user.save();
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

/** Load the current state of a user (role/active may have changed since login). */
export async function getActiveActor(id: string): Promise<Actor | null> {
  await connectDB();
  const user = await User.findById(id)
    .lean()
    .catch(() => null);
  if (!user || !user.active) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export async function listUsers(actor: Actor) {
  assertCan(actor, "users:manage");
  await connectDB();
  return (await User.find({}).sort({ createdAt: 1 }).lean()).map(dto);
}

/** Users that leads can be assigned to (owner/admin/sales, active). */
export async function listAssignableUsers(actor: Actor) {
  assertCan(actor, "leads:read");
  await connectDB();
  const users = await User.find(
    { active: true, role: { $in: ["owner", "admin", "sales"] } },
    { name: 1 },
  )
    .sort({ name: 1 })
    .lean();
  return users.map((u) => ({ id: String(u._id), name: u.name }));
}

async function issueToken(userId: string, ttlMs: number) {
  const token = randomBytes(32).toString("base64url");
  await User.updateOne(
    { _id: userId },
    { $set: { resetTokenHash: sha256(token), resetTokenExpires: new Date(Date.now() + ttlMs) } },
  );
  return token;
}

export async function inviteUser(actor: Actor, input: unknown) {
  assertCan(actor, "users:manage");
  const parsed = inviteUserInput.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  if (!canManageRole(actor.role, parsed.data.role))
    throw new ForbiddenError("Only an owner can create another owner.");
  await connectDB();
  if (await User.exists({ email: parsed.data.email })) {
    return {
      ok: false as const,
      error: "A user with that email already exists.",
      fieldErrors: { email: "Already registered" },
    };
  }
  // Random unusable password until the invitee sets their own via the emailed link.
  const user = await User.create({
    ...parsed.data,
    passwordHash: await hashPassword(randomBytes(24).toString("hex")),
    active: true,
  });
  const token = await issueToken(String(user._id), INVITE_TTL_MS);
  const link = `${env.siteUrl}/admin/reset-password?token=${token}`;
  const mail = layout({
    title: "You've been invited to the HumSols admin",
    intro: [
      `Hi ${user.name},`,
      `${actor.name} has given you ${user.role} access to the Human Solutions website admin. Set your password to get started. The link expires in 7 days.`,
    ],
    cta: { label: "Set your password", href: link },
  });
  let emailError: string | undefined;
  try {
    await sendMail({ to: user.email, subject: "Your HumSols admin invitation", ...mail });
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
  }
  await writeAudit(actor, "create", "User", String(user._id), {
    email: user.email,
    role: user.role,
  });
  return { ok: true as const, id: String(user._id), inviteLink: link, emailError };
}

async function loadTarget(actor: Actor, id: string) {
  const target = await User.findById(id)
    .lean()
    .catch(() => null);
  if (!target) throw new Error("User not found");
  if (!canManageRole(actor.role, target.role))
    throw new ForbiddenError("Only an owner can change another owner.");
  return target;
}

async function assertNotLastOwner(id: string) {
  const owners = await User.countDocuments({ role: "owner", active: true, _id: { $ne: id } });
  if (owners === 0) throw new Error("There must always be at least one active owner.");
}

export async function changeUserRole(actor: Actor, id: string, role: Role) {
  assertCan(actor, "users:manage");
  if (!ROLES.includes(role)) throw new Error("Invalid role");
  await connectDB();
  const target = await loadTarget(actor, id);
  if (!canManageRole(actor.role, role))
    throw new ForbiddenError("Only an owner can grant the owner role.");
  if (target.role === "owner" && role !== "owner") await assertNotLastOwner(id);
  await User.updateOne({ _id: id }, { $set: { role } });
  await writeAudit(actor, "update", "User", id, { role: { from: target.role, to: role } });
}

export async function setUserActive(actor: Actor, id: string, active: boolean) {
  assertCan(actor, "users:manage");
  if (actor.id === id && !active) throw new Error("You cannot deactivate your own account.");
  await connectDB();
  const target = await loadTarget(actor, id);
  if (!active && target.role === "owner") await assertNotLastOwner(id);
  await User.updateOne({ _id: id }, { $set: { active } });
  await writeAudit(actor, active ? "activate" : "deactivate", "User", id);
}

export async function changeOwnPassword(actor: Actor, input: unknown) {
  const parsed = changePasswordInput.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  await connectDB();
  const user = await User.findById(actor.id).select("+passwordHash");
  if (!user) return { ok: false as const, error: "Account not found." };
  if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return {
      ok: false as const,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: "Incorrect password" },
    };
  }
  user.passwordHash = await hashPassword(parsed.data.newPassword);
  await user.save();
  await writeAudit(actor, "password_change", "User", actor.id);
  return { ok: true as const };
}

/** Always resolves the same way whether or not the email exists (no account enumeration). */
export async function requestPasswordReset(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim(), active: true }).lean();
  if (!user) return;
  const token = await issueToken(String(user._id), RESET_TTL_MS);
  const mail = layout({
    title: "Reset your HumSols admin password",
    intro: [
      `Hi ${user.name},`,
      "Someone asked to reset the password for your admin account. If this was you, use the button below. The link expires in 1 hour. If it wasn't you, ignore this email.",
    ],
    cta: { label: "Reset password", href: `${env.siteUrl}/admin/reset-password?token=${token}` },
  });
  try {
    await sendMail({ to: user.email, subject: "Reset your HumSols admin password", ...mail });
  } catch (err) {
    console.error("[mail] password reset email failed", err);
  }
  await writeAudit(null, "password_reset_requested", "User", String(user._id));
}

export async function resetPassword(input: unknown) {
  const parsed = resetPasswordInput.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  await connectDB();
  const user = await User.findOne({
    resetTokenHash: sha256(parsed.data.token),
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user)
    return { ok: false as const, error: "This link is invalid or has expired. Request a new one." };
  user.passwordHash = await hashPassword(parsed.data.newPassword);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  await writeAudit(null, "password_reset", "User", String(user._id));
  return { ok: true as const };
}
