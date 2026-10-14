"use client";

import { useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/admin/actions/content";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormError, Input, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/services/settings";
import { settingsInput } from "@/lib/validation/content";
import { fieldErrors } from "@/lib/validation/lead";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const toast = useToast();
  const [s, setS] = useState<SiteSettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, start] = useTransition();
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setS((x) => ({ ...x, [key]: value }));

  // Comma/line separated text <-> array helpers for simple list fields.
  const listText = (v: string[]) => v.join("\n");
  const fromText = (v: string) =>
    v
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = settingsInput.safeParse(s);
        if (!parsed.success) {
          setErrors(fieldErrors(parsed.error));
          setFormError("Please fix the highlighted fields.");
          return;
        }
        setErrors({});
        setFormError(undefined);
        start(async () => {
          const r = await saveSettingsAction(JSON.stringify(s));
          if (!r.ok) {
            setErrors(r.fieldErrors ?? {});
            setFormError(r.error);
          } else toast("Settings saved — the site updates immediately");
        });
      }}
    >
      <FormError message={formError} />

      <Section title="Company">
        <Field id="companyName" label="Company name" error={errors.companyName} required>
          <Input
            id="companyName"
            value={s.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />
        </Field>
        <Field id="shortName" label="Short name" error={errors.shortName}>
          <Input
            id="shortName"
            value={s.shortName}
            onChange={(e) => set("shortName", e.target.value)}
          />
        </Field>
        <Field id="tagline" label="Tagline" error={errors.tagline}>
          <Input id="tagline" value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
      </Section>

      <Section title="Contacts">
        <Field
          id="phones"
          label="Phone numbers"
          hint="One per line, in display format"
          error={errors.phones ?? errors["phones.0"]}
        >
          <Textarea
            id="phones"
            rows={2}
            value={listText(s.phones)}
            onChange={(e) => set("phones", fromText(e.target.value))}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email} required>
          <Input
            id="email"
            type="email"
            value={s.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field
          id="whatsapp"
          label="WhatsApp number"
          hint="International format without +, e.g. 254725742737"
          error={errors.whatsapp}
        >
          <Input
            id="whatsapp"
            value={s.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Field>
        <Field id="address" label="Address" error={errors.address}>
          <Input id="address" value={s.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field id="hours" label="Opening hours" error={errors.hours}>
          <Input id="hours" value={s.hours} onChange={(e) => set("hours", e.target.value)} />
        </Field>
        <Field
          id="mapEmbedUrl"
          label="Google Maps embed URL"
          hint="https://www.google.com/maps?q=…&output=embed"
          error={errors.mapEmbedUrl}
        >
          <Input
            id="mapEmbedUrl"
            value={s.mapEmbedUrl}
            onChange={(e) => set("mapEmbedUrl", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Social links">
        <div className="space-y-2 sm:col-span-2">
          {s.social.map((link, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
              <Input
                aria-label={`Social link ${i + 1} label`}
                placeholder="Facebook"
                value={link.label}
                onChange={(e) =>
                  set(
                    "social",
                    s.social.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
              />
              <Input
                aria-label={`Social link ${i + 1} URL`}
                placeholder="https://…"
                value={link.url}
                aria-invalid={errors[`social.${i}.url`] ? true : undefined}
                onChange={(e) =>
                  set(
                    "social",
                    s.social.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                  )
                }
              />
              <button
                type="button"
                className="rounded-md p-2 text-danger hover:bg-danger/10"
                aria-label="Remove link"
                onClick={() =>
                  set(
                    "social",
                    s.social.filter((_, j) => j !== i),
                  )
                }
              >
                <Icon name="trash" className="size-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => set("social", [...s.social, { label: "", url: "" }])}
          >
            <Icon name="plus" className="size-4" /> Add link
          </Button>
        </div>
      </Section>

      <Section title="Lead notifications">
        <Field
          id="notificationRecipients"
          label="Send new-lead emails to"
          hint="One email address per line"
          error={
            errors.notificationRecipients ??
            Object.entries(errors).find(([k]) => k.startsWith("notificationRecipients."))?.[1]
          }
          className="sm:col-span-2"
        >
          <Textarea
            id="notificationRecipients"
            rows={3}
            value={listText(s.notificationRecipients)}
            onChange={(e) => set("notificationRecipients", fromText(e.target.value))}
          />
        </Field>
      </Section>

      <Section title="SEO defaults">
        <Field
          id="seoTitle"
          label="Default title"
          error={errors["seo.title"]}
          className="sm:col-span-2"
        >
          <Input
            id="seoTitle"
            value={s.seo.title}
            onChange={(e) => set("seo", { ...s.seo, title: e.target.value })}
          />
        </Field>
        <Field
          id="seoDescription"
          label="Default description"
          error={errors["seo.description"]}
          className="sm:col-span-2"
        >
          <Textarea
            id="seoDescription"
            rows={2}
            value={s.seo.description}
            onChange={(e) => set("seo", { ...s.seo, description: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Announcement bar">
        <Field id="annText" label="Text" error={errors["announcement.text"]}>
          <Input
            id="annText"
            value={s.announcement.text}
            onChange={(e) => set("announcement", { ...s.announcement, text: e.target.value })}
          />
        </Field>
        <Field
          id="annHref"
          label="Link (optional)"
          hint="e.g. /internet"
          error={errors["announcement.href"]}
        >
          <Input
            id="annHref"
            value={s.announcement.href ?? ""}
            onChange={(e) => set("announcement", { ...s.announcement, href: e.target.value })}
          />
        </Field>
        <Checkbox
          label="Show the announcement bar"
          checked={s.announcement.active}
          onChange={(e) => set("announcement", { ...s.announcement, active: e.target.checked })}
        />
      </Section>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6">
      <legend className="px-1 text-base font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}
