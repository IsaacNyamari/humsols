"use client";

import Link from "next/link";
import { createContext, useContext } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { a11y, Checkbox, Field, Input } from "@/components/ui/form";

type Errors = Record<string, string>;

/** Editable site copy that client forms need (provided by the site layout). */
const FormCopyContext = createContext({
  successText:
    "We've emailed you a copy. Our team will contact you, usually within one working day. For anything urgent, call or WhatsApp us and quote your reference.",
});

export function FormCopyProvider({
  successText,
  children,
}: {
  successText: string;
  children: React.ReactNode;
}) {
  return <FormCopyContext value={{ successText }}>{children}</FormCopyContext>;
}

/** Prefix ids ("cov--name") so two forms can share a page; field names stay plain. */
const withPrefix = (prefix: string, id: string) => (prefix ? `${prefix}--${id}` : id);

export function ContactFields({
  errors,
  showCompany = true,
  defaults,
  prefix = "",
}: {
  errors: Errors;
  showCompany?: boolean;
  defaults?: { name?: string; email?: string; phone?: string };
  prefix?: string;
}) {
  const p = (id: string) => withPrefix(prefix, id);
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id={p("name")} label="Full name" required error={errors.name}>
        <Input
          {...a11y(p("name"), errors.name)}
          autoComplete="name"
          defaultValue={defaults?.name}
          required
        />
      </Field>
      <Field
        id={p("phone")}
        label="Phone"
        required
        error={errors.phone}
        hint="We'll call or WhatsApp you on this number"
      >
        <Input
          {...a11y(p("phone"), errors.phone, true)}
          type="tel"
          autoComplete="tel"
          placeholder="+254 7XX XXX XXX"
          defaultValue={defaults?.phone}
          required
        />
      </Field>
      <Field id={p("email")} label="Email" required error={errors.email}>
        <Input
          {...a11y(p("email"), errors.email)}
          type="email"
          autoComplete="email"
          defaultValue={defaults?.email}
          required
        />
      </Field>
      {showCompany ? (
        <Field id={p("company")} label="Company or organisation" error={errors.company}>
          <Input {...a11y(p("company"), errors.company)} autoComplete="organization" />
        </Field>
      ) : null}
    </div>
  );
}

/** Hidden from people (and screen readers); bots tend to fill it in. */
export function Honeypot({ prefix = "" }: { prefix?: string }) {
  const id = withPrefix(prefix, "website");
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function ConsentField({
  error,
  prefix = "",
  defaultChecked,
}: {
  error?: string;
  prefix?: string;
  defaultChecked?: boolean;
}) {
  const id = withPrefix(prefix, "consent");
  return (
    <div>
      <Checkbox
        name="consent"
        id={id}
        defaultChecked={defaultChecked}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        label={
          <>
            I agree that Human Solutions may use these details to respond to my request, as
            described in the{" "}
            <Link href="/privacy" className="font-semibold text-primary underline" target="_blank">
              privacy policy
            </Link>
            .
          </>
        }
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  submitting,
  children,
}: {
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
      {submitting ? "Sending…" : children}
    </Button>
  );
}

export function SuccessPanel({
  reference,
  title = "Thank you — we've received your request",
  onReset,
}: {
  reference: string;
  title?: string;
  onReset?: () => void;
}) {
  const { successText } = useContext(FormCopyContext);
  return (
    <div
      role="status"
      className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center"
      data-testid="lead-success"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success text-white">
        <Icon name="check" className="size-7" />
      </span>
      <h2 className="mt-5 text-2xl">{title}</h2>
      <p className="mt-3 text-muted">Your reference number is</p>
      <p
        className="mt-1 text-3xl font-extrabold tracking-wide text-primary"
        data-testid="lead-reference"
      >
        {reference}
      </p>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted">{successText}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
        {onReset ? (
          <Button variant="ghost" onClick={onReset}>
            Send another request
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function formBase(fd: FormData) {
  return {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    company: String(fd.get("company") ?? ""),
    website: String(fd.get("website") ?? ""),
    consent: fd.get("consent") === "on",
  };
}
