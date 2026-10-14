"use client";

import { a11y, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { SITE_TYPES } from "@/lib/validation/lead";
import {
  ConsentField,
  ContactFields,
  formBase,
  Honeypot,
  SubmitButton,
  SuccessPanel,
} from "./shared";
import { numberOrUndefined, str, useLeadForm } from "./use-lead-form";

export const SITE_TYPE_LABELS: Record<(typeof SITE_TYPES)[number], string> = {
  home: "Home",
  office: "Office",
  shop: "Shop / retail",
  estate: "Estate / apartments",
  school: "School",
  church: "Church",
  warehouse: "Warehouse / industrial",
  other: "Other",
};

export function CctvSurveyForm() {
  const { status, errors, formError, reference, submit, reset } = useLeadForm("cctv_survey");

  if (status === "success" && reference)
    return (
      <SuccessPanel
        reference={reference}
        title="Your free site survey is booked in"
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
          details: {
            preferredDate: str(fd, "preferredDate"),
            siteType: str(fd, "siteType"),
            camerasEstimate: numberOrUndefined(fd.get("camerasEstimate")),
            location: str(fd, "location"),
          },
        });
      }}
    >
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="preferredDate"
          label="Preferred survey date"
          required
          error={errors["details.preferredDate"]}
          hint="We'll confirm the exact time by phone"
        >
          <Input
            {...a11y("preferredDate", errors["details.preferredDate"], true)}
            type="date"
            required
          />
        </Field>
        <Field id="siteType" label="Type of site" required error={errors["details.siteType"]}>
          <Select {...a11y("siteType", errors["details.siteType"])} defaultValue="" required>
            <option value="" disabled>
              Choose…
            </option>
            {SITE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SITE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="camerasEstimate"
          label="Roughly how many cameras?"
          required
          error={errors["details.camerasEstimate"]}
          hint="A guess is fine — we'll advise"
        >
          <Input
            {...a11y("camerasEstimate", errors["details.camerasEstimate"], true)}
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            defaultValue={4}
            required
          />
        </Field>
        <Field id="location" label="Site location" required error={errors["details.location"]}>
          <Input
            {...a11y("location", errors["details.location"])}
            placeholder="Area and landmark"
            required
          />
        </Field>
      </div>
      <ContactFields errors={errors} />
      <Field id="message" label="Anything we should know?" error={errors.message}>
        <Textarea
          {...a11y("message", errors.message)}
          rows={3}
          placeholder="e.g. areas to cover, existing cameras, access times"
        />
      </Field>
      <Honeypot />
      <ConsentField error={errors.consent} />
      <SubmitButton submitting={status === "submitting"}>Book free site survey</SubmitButton>
    </form>
  );
}
