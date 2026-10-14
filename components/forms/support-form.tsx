"use client";

import { a11y, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import {
  ConsentField,
  ContactFields,
  formBase,
  Honeypot,
  SubmitButton,
  SuccessPanel,
} from "./shared";
import { str, useLeadForm } from "./use-lead-form";

export function SupportForm() {
  const { status, errors, formError, reference, submit, reset } = useLeadForm("support");

  if (status === "success" && reference)
    return <SuccessPanel reference={reference} title="Support request logged" onReset={reset} />;

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
          details: {
            category: str(fd, "category"),
            priority: str(fd, "priority"),
            accountRef: str(fd, "accountRef"),
          },
        });
      }}
    >
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="category" label="What needs help?" required error={errors["details.category"]}>
          <Select {...a11y("category", errors["details.category"])} defaultValue="" required>
            <option value="" disabled>
              Choose…
            </option>
            <option value="internet">Internet fault</option>
            <option value="cctv">CCTV fault</option>
            <option value="software">Software / system issue</option>
            <option value="website">Website issue</option>
            <option value="other">Something else</option>
          </Select>
        </Field>
        <Field id="priority" label="Priority" required error={errors["details.priority"]}>
          <Select {...a11y("priority", errors["details.priority"])} defaultValue="normal">
            <option value="low">Low — when convenient</option>
            <option value="normal">Normal</option>
            <option value="high">High — affecting work</option>
            <option value="urgent">Urgent — everything is down</option>
          </Select>
        </Field>
        <Field
          id="accountRef"
          label="Account / site reference"
          error={errors["details.accountRef"]}
        >
          <Input
            {...a11y("accountRef", errors["details.accountRef"])}
            placeholder="If you have one"
          />
        </Field>
      </div>
      <Field
        id="message"
        label="Describe the problem"
        required
        error={errors.message}
        hint="When did it start? What have you tried?"
      >
        <Textarea {...a11y("message", errors.message, true)} rows={6} required />
      </Field>
      <ContactFields errors={errors} />
      <Honeypot />
      <ConsentField error={errors.consent} />
      <SubmitButton submitting={status === "submitting"}>Submit support request</SubmitButton>
    </form>
  );
}
