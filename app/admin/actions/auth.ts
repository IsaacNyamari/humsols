"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { getActor } from "@/lib/auth/session";
import { clientIpFromHeaders } from "@/lib/auth/ip";
import { rateLimit } from "@/lib/rate-limit";
import { changeOwnPassword, requestPasswordReset, resetPassword } from "@/lib/services/users";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  // Only allow redirects inside the admin.
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIpFromHeaders();
  if (!rateLimit(`login-ip:${ip}`, { max: 20, windowMs: 15 * 60 * 1000 }).ok) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeNext(formData.get("next")),
    });
  } catch (err) {
    if (err instanceof AuthError)
      return { error: "Incorrect email or password, or the account is inactive." };
    throw err; // redirect after successful sign-in
  }
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = await clientIpFromHeaders();
  if (!rateLimit(`forgot:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 }).ok) {
    return { error: "Too many requests. Please wait a few minutes." };
  }
  const email = String(formData.get("email") ?? "").trim();
  if (email) await requestPasswordReset(email);
  // Same answer whether or not the account exists.
  return {
    ok: true,
    message:
      "If that email belongs to an active admin account, we've sent a reset link. It expires in 1 hour.",
  };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await resetPassword({
    token: String(formData.get("token") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!result.ok)
    return {
      error: result.error,
      fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
    };
  redirect("/admin/login?reset=1");
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await getActor();
  if (!actor) redirect("/admin/login");
  const result = await changeOwnPassword(actor, {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!result.ok)
    return {
      error: result.error,
      fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
    };
  return { ok: true, message: "Password changed." };
}
