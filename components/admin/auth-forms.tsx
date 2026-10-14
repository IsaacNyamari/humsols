"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  type FormState,
} from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { a11y, Field, FormError, Input } from "@/components/ui/form";

const initial: FormState = {};

function Success({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm font-medium text-success"
    >
      {message}
    </div>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-5">
      <Success message={notice} />
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <Field id="email" label="Email">
        <Input {...a11y("email")} type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="password" label="Password">
        <Input {...a11y("password")} type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm">
        <Link href="/admin/forgot-password" className="font-semibold text-primary hover:underline">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  if (state.ok) return <Success message={state.message} />;
  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />
      <Field id="email" label="Email" hint="We'll send a reset link to this address">
        <Input {...a11y("email", undefined, true)} type="email" autoComplete="email" required />
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />
      <input type="hidden" name="token" value={token} />
      <Field
        id="newPassword"
        label="New password"
        error={e.newPassword}
        hint="At least 10 characters with a letter and a number"
      >
        <Input
          {...a11y("newPassword", e.newPassword, true)}
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Field id="confirm" label="Confirm password" error={e.confirm}>
        <Input
          {...a11y("confirm", e.confirm)}
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Set password"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-md space-y-5">
      <FormError message={state.error} />
      <Success message={state.ok ? state.message : undefined} />
      <Field id="currentPassword" label="Current password" error={e.currentPassword}>
        <Input
          {...a11y("currentPassword", e.currentPassword)}
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        id="newPassword"
        label="New password"
        error={e.newPassword}
        hint="At least 10 characters with a letter and a number"
      >
        <Input
          {...a11y("newPassword", e.newPassword, true)}
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Field id="confirm" label="Confirm new password" error={e.confirm}>
        <Input
          {...a11y("confirm", e.confirm)}
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
