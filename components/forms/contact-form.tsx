"use client";

import { a11y, Field, FormError, Input, Textarea } from "@/components/ui/form";
import {
  ConsentField,
  ContactFields,
  formBase,
  Honeypot,
  SubmitButton,
  SuccessPanel,
} from "./shared";
import { str, useLeadForm } from "./use-lead-form";

export function ContactForm() {
  const { status, errors, formError, reference, submit, reset } = useLeadForm("contact");

  if (status === "success" && reference)
    return (
      <SuccessPanel
        reference={reference}
        title="Thanks — your message is on its way"
        onReset={reset}
      />
    );

  return (
    <form
      noValidate
      className="relative space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await submit({
          ...formBase(fd),
          message: str(fd, "message"),
          details: { subject: str(fd, "subject") },
        });
      }}
    >
      <FormError message={formError} />
      <ContactFields errors={errors} />
      <Field id="subject" label="Subject" error={errors["details.subject"]}>
        <Input {...a11y("subject", errors["details.subject"])} />
      </Field>
      <Field id="message" label="How can we help?" required error={errors.message}>
        <Textarea {...a11y("message", errors.message)} required rows={6} />
      </Field>
      <Honeypot />
      <ConsentField error={errors.consent} />
      <SubmitButton submitting={status === "submitting"}>Send message</SubmitButton>
    </form>
  );
}
