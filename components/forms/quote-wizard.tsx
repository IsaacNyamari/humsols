"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { a11y, Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { SERVICE_NAMES, SERVICE_SLUGS, type ServiceSlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  fieldErrors,
  leadSubmissionSchema,
  QUOTE_ANSWER_KEYS,
  SITE_TYPES,
} from "@/lib/validation/lead";
import { SITE_TYPE_LABELS } from "./cctv-survey-form";
import { ConsentField, ContactFields, Honeypot, SuccessPanel } from "./shared";
import { useLeadForm } from "./use-lead-form";

type Answers = Record<string, unknown>;
type Details = { services: ServiceSlug[]; budget?: string; timeline?: string } & Record<
  string,
  Answers | unknown
>;

const STEPS = ["Services", "Your project", "Contact details", "Review"] as const;

const WEB_FEATURES = [
  "M-Pesa / online payments",
  "User accounts & login",
  "Admin dashboard",
  "E-commerce / shop",
  "Bookings / appointments",
  "Blog / news",
  "SMS notifications",
  "Multiple languages",
];
const INTEGRATIONS = [
  "M-Pesa",
  "SMS",
  "Email",
  "Accounting software",
  "Existing database",
  "Third-party API",
];

const DEFAULTS: Record<string, Answers> = {
  web: { pages: "not-sure", features: [] },
  website: { pages: "1-5", features: [] },
  software: { problem: "", integrations: [] },
  billing: { systemType: "water", mpesa: true },
  cctv: { cameras: 4, placement: "both", siteType: "office", remoteViewing: true, location: "" },
  internet: { location: "", audience: "home" },
};

const SERVICE_ICONS: Record<ServiceSlug, string> = {
  "web-applications": "app",
  "custom-software": "code",
  "billing-systems": "receipt",
  websites: "globe",
  "cctv-installation": "camera",
  internet: "wifi",
};

export function QuoteWizard({ initialService }: { initialService?: string }) {
  const lead = useLeadForm("quote");
  const preselected = (SERVICE_SLUGS as readonly string[]).includes(initialService ?? "")
    ? [initialService as ServiceSlug]
    : [];
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(() => {
    const d: Details = { services: preselected };
    for (const s of preselected) d[QUOTE_ANSWER_KEYS[s]] = { ...DEFAULTS[QUOTE_ANSWER_KEYS[s]] };
    return d;
  });
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (lead.status === "success" && lead.reference)
    return <SuccessPanel reference={lead.reference} title="Quote request received" />;

  const payload = () => ({ type: "quote", ...contact, details });

  function stepErrors(target: number) {
    const parsed = leadSubmissionSchema.safeParse({ ...payload(), sourcePage: "/quote" });
    if (parsed.success) return {};
    const all = fieldErrors(parsed.error);
    const contactKeys = ["name", "email", "phone", "company", "consent", "message"];
    return Object.fromEntries(
      Object.entries(all).filter(([k]) => {
        if (target === 0) return k.startsWith("details.services");
        if (target === 1) return k.startsWith("details.") && !k.startsWith("details.services");
        if (target === 2) return contactKeys.includes(k);
        return true;
      }),
    );
  }

  function next() {
    const errs = stepErrors(step);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid='true'], [data-step-error]")?.focus(),
      );
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleService(slug: ServiceSlug) {
    setDetails((d) => {
      const key = QUOTE_ANSWER_KEYS[slug];
      const selected = d.services.includes(slug);
      const services = selected ? d.services.filter((s) => s !== slug) : [...d.services, slug];
      const nextDetails: Details = { ...d, services };
      if (selected) delete nextDetails[key];
      else nextDetails[key] = d[key] ?? { ...DEFAULTS[key] };
      return nextDetails;
    });
  }

  function setAnswer(key: string, field: string, value: unknown) {
    setDetails((d) => ({ ...d, [key]: { ...(d[key] as Answers), [field]: value } }));
  }

  function toggleListAnswer(key: string, field: string, item: string) {
    const list = (((details[key] as Answers)?.[field] as string[]) ?? []).slice();
    const i = list.indexOf(item);
    if (i >= 0) list.splice(i, 1);
    else list.push(item);
    setAnswer(key, field, list);
  }

  // Client step errors first, then anything the server rejected.
  const allErrors = { ...lead.errors, ...errors };
  const err = (path: string) => allErrors[path];

  return (
    <div>
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className="flex flex-col gap-2"
          >
            <span className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                i === step ? "text-fg" : "text-muted",
              )}
            >
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="mb-6 text-sm text-muted sm:hidden">
        Step {step + 1} of {STEPS.length}: <strong className="text-fg">{STEPS[step]}</strong>
      </p>

      <form
        noValidate
        className="relative space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) return next();
          const all = stepErrors(3);
          setErrors(all);
          if (Object.keys(all).length) return;
          await lead.submit(payload());
        }}
      >
        <FormError message={lead.formError} />

        {step === 0 && (
          <fieldset>
            <legend className="mb-4 text-xl font-bold">Which services do you need?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_SLUGS.map((slug) => {
                const checked = details.services.includes(slug);
                return (
                  <label
                    key={slug}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      checked
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleService(slug)}
                      name="services"
                      value={slug}
                      data-testid={`quote-service-${slug}`}
                    />
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-lg",
                        checked ? "bg-primary text-primary-fg" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon name={SERVICE_ICONS[slug]} />
                    </span>
                    <span className="flex-1 font-semibold">{SERVICE_NAMES[slug]}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full border",
                        checked ? "border-primary bg-primary text-primary-fg" : "border-border",
                      )}
                    >
                      {checked ? <Icon name="check" className="size-4" /> : null}
                    </span>
                  </label>
                );
              })}
            </div>
            {err("details.services") ? (
              <p
                role="alert"
                tabIndex={-1}
                data-step-error
                className="mt-3 text-sm font-medium text-danger"
              >
                {err("details.services")}
              </p>
            ) : null}
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-8">
            {details.services.map((slug) => {
              const key = QUOTE_ANSWER_KEYS[slug];
              const a = (details[key] as Answers) ?? {};
              const id = (f: string) => `${key}-${f}`;
              const e = (f: string) =>
                err(`details.${key}.${f}`) ?? (f === "_" ? err(`details.${key}`) : undefined);
              return (
                <fieldset
                  key={slug}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6"
                >
                  <legend className="flex items-center gap-2 px-2 text-lg font-bold">
                    <Icon name={SERVICE_ICONS[slug]} className="size-5 text-primary" />{" "}
                    {SERVICE_NAMES[slug]}
                  </legend>
                  <div className="mt-2 grid gap-5 sm:grid-cols-2">
                    {(key === "web" || key === "website") && (
                      <>
                        <Field
                          id={id("pages")}
                          label={key === "web" ? "How many main screens/pages?" : "How many pages?"}
                          error={e("pages")}
                        >
                          <Select
                            {...a11y(id("pages"), e("pages"))}
                            value={String(a.pages ?? "not-sure")}
                            onChange={(ev) => setAnswer(key, "pages", ev.target.value)}
                          >
                            <option value="1-5">1–5</option>
                            <option value="6-15">6–15</option>
                            <option value="16+">16 or more</option>
                            <option value="not-sure">Not sure yet</option>
                          </Select>
                        </Field>
                        <Field
                          id={id("deadline")}
                          label="When do you need it?"
                          error={e("deadline")}
                        >
                          <Input
                            {...a11y(id("deadline"), e("deadline"))}
                            placeholder="e.g. by end of March"
                            value={String(a.deadline ?? "")}
                            onChange={(ev) => setAnswer(key, "deadline", ev.target.value)}
                          />
                        </Field>
                        <CheckGroup
                          label="Features you need"
                          items={WEB_FEATURES}
                          selected={(a.features as string[]) ?? []}
                          onToggle={(item) => toggleListAnswer(key, "features", item)}
                        />
                        <Field
                          id={id("description")}
                          label="Describe the project"
                          error={e("description")}
                          className="sm:col-span-2"
                        >
                          <Textarea
                            {...a11y(id("description"), e("description"))}
                            rows={4}
                            value={String(a.description ?? "")}
                            onChange={(ev) => setAnswer(key, "description", ev.target.value)}
                          />
                        </Field>
                      </>
                    )}
                    {key === "software" && (
                      <>
                        <Field
                          id={id("problem")}
                          label="What should the system do?"
                          required
                          error={e("problem")}
                          className="sm:col-span-2"
                        >
                          <Textarea
                            {...a11y(id("problem"), e("problem"))}
                            rows={4}
                            value={String(a.problem ?? "")}
                            onChange={(ev) => setAnswer(key, "problem", ev.target.value)}
                          />
                        </Field>
                        <Field
                          id={id("users")}
                          label="How many people will use it?"
                          error={e("users")}
                        >
                          <Select
                            {...a11y(id("users"), e("users"))}
                            value={String(a.users ?? "")}
                            onChange={(ev) => setAnswer(key, "users", ev.target.value)}
                          >
                            <option value="">Not sure</option>
                            <option value="1-5">1–5</option>
                            <option value="6-20">6–20</option>
                            <option value="21-100">21–100</option>
                            <option value="100+">More than 100</option>
                          </Select>
                        </Field>
                        <Field
                          id={id("deadline")}
                          label="When do you need it?"
                          error={e("deadline")}
                        >
                          <Input
                            {...a11y(id("deadline"), e("deadline"))}
                            value={String(a.deadline ?? "")}
                            onChange={(ev) => setAnswer(key, "deadline", ev.target.value)}
                          />
                        </Field>
                        <CheckGroup
                          label="Integrations"
                          items={INTEGRATIONS}
                          selected={(a.integrations as string[]) ?? []}
                          onToggle={(item) => toggleListAnswer(key, "integrations", item)}
                        />
                      </>
                    )}
                    {key === "billing" && (
                      <>
                        <Field
                          id={id("systemType")}
                          label="What do you need to bill?"
                          required
                          error={e("systemType")}
                        >
                          <Select
                            {...a11y(id("systemType"), e("systemType"))}
                            value={String(a.systemType ?? "water")}
                            onChange={(ev) => setAnswer(key, "systemType", ev.target.value)}
                          >
                            <option value="water">Water / utility billing</option>
                            <option value="subscription">Subscriptions</option>
                            <option value="invoicing">Invoicing</option>
                            <option value="pos">Point of sale (POS)</option>
                            <option value="inventory">Inventory</option>
                            <option value="other">Other</option>
                          </Select>
                        </Field>
                        <Field
                          id={id("customers")}
                          label="Approximate number of customers/accounts"
                          error={e("customers")}
                        >
                          <Input
                            {...a11y(id("customers"), e("customers"))}
                            value={String(a.customers ?? "")}
                            onChange={(ev) => setAnswer(key, "customers", ev.target.value)}
                          />
                        </Field>
                        <Checkbox
                          label="We want to accept M-Pesa payments"
                          checked={Boolean(a.mpesa)}
                          onChange={(ev) => setAnswer(key, "mpesa", ev.target.checked)}
                        />
                        <Field
                          id={id("notes")}
                          label="Anything else?"
                          error={e("notes")}
                          className="sm:col-span-2"
                        >
                          <Textarea
                            {...a11y(id("notes"), e("notes"))}
                            rows={3}
                            value={String(a.notes ?? "")}
                            onChange={(ev) => setAnswer(key, "notes", ev.target.value)}
                          />
                        </Field>
                      </>
                    )}
                    {key === "cctv" && (
                      <>
                        <Field
                          id={id("cameras")}
                          label="How many cameras?"
                          required
                          error={e("cameras")}
                          hint="An estimate is fine"
                        >
                          <Input
                            {...a11y(id("cameras"), e("cameras"), true)}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={500}
                            value={a.cameras === undefined ? "" : String(a.cameras)}
                            onChange={(ev) =>
                              setAnswer(
                                key,
                                "cameras",
                                ev.target.value === "" ? undefined : Number(ev.target.value),
                              )
                            }
                            data-testid="quote-cctv-cameras"
                          />
                        </Field>
                        <Field
                          id={id("placement")}
                          label="Indoor or outdoor?"
                          required
                          error={e("placement")}
                        >
                          <Select
                            {...a11y(id("placement"), e("placement"))}
                            value={String(a.placement ?? "both")}
                            onChange={(ev) => setAnswer(key, "placement", ev.target.value)}
                          >
                            <option value="indoor">Indoor</option>
                            <option value="outdoor">Outdoor</option>
                            <option value="both">Both</option>
                          </Select>
                        </Field>
                        <Field
                          id={id("siteType")}
                          label="Type of site"
                          required
                          error={e("siteType")}
                        >
                          <Select
                            {...a11y(id("siteType"), e("siteType"))}
                            value={String(a.siteType ?? "office")}
                            onChange={(ev) => setAnswer(key, "siteType", ev.target.value)}
                          >
                            {SITE_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {SITE_TYPE_LABELS[t]}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field
                          id={id("location")}
                          label="Site location"
                          required
                          error={e("location")}
                        >
                          <Input
                            {...a11y(id("location"), e("location"))}
                            value={String(a.location ?? "")}
                            onChange={(ev) => setAnswer(key, "location", ev.target.value)}
                            data-testid="quote-cctv-location"
                          />
                        </Field>
                        <Checkbox
                          label="View cameras remotely on my phone"
                          checked={Boolean(a.remoteViewing)}
                          onChange={(ev) => setAnswer(key, "remoteViewing", ev.target.checked)}
                        />
                      </>
                    )}
                    {key === "internet" && (
                      <>
                        <Field
                          id={id("location")}
                          label="Estate or area"
                          required
                          error={e("location")}
                        >
                          <Input
                            {...a11y(id("location"), e("location"))}
                            value={String(a.location ?? "")}
                            onChange={(ev) => setAnswer(key, "location", ev.target.value)}
                          />
                        </Field>
                        <Field id={id("audience")} label="For" required error={e("audience")}>
                          <Select
                            {...a11y(id("audience"), e("audience"))}
                            value={String(a.audience ?? "home")}
                            onChange={(ev) => setAnswer(key, "audience", ev.target.value)}
                          >
                            <option value="home">Home</option>
                            <option value="business">Business</option>
                          </Select>
                        </Field>
                        <Field
                          id={id("speedMbps")}
                          label="Speed you're looking for"
                          error={e("speedMbps")}
                        >
                          <Select
                            {...a11y(id("speedMbps"), e("speedMbps"))}
                            value={a.speedMbps === undefined ? "" : String(a.speedMbps)}
                            onChange={(ev) =>
                              setAnswer(
                                key,
                                "speedMbps",
                                ev.target.value ? Number(ev.target.value) : undefined,
                              )
                            }
                          >
                            <option value="">Not sure — advise me</option>
                            {[10, 20, 40, 50, 100].map((s) => (
                              <option key={s} value={s}>
                                {s} Mbps
                              </option>
                            ))}
                          </Select>
                        </Field>
                      </>
                    )}
                  </div>
                </fieldset>
              );
            })}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="budget" label="Budget (KES), if known" error={err("details.budget")}>
                <Input
                  {...a11y("budget", err("details.budget"))}
                  value={details.budget ?? ""}
                  onChange={(ev) => setDetails((d) => ({ ...d, budget: ev.target.value }))}
                  placeholder="e.g. 50,000 – 100,000"
                />
              </Field>
              <Field
                id="timeline"
                label="When would you like to start?"
                error={err("details.timeline")}
              >
                <Input
                  {...a11y("timeline", err("details.timeline"))}
                  value={details.timeline ?? ""}
                  onChange={(ev) => setDetails((d) => ({ ...d, timeline: ev.target.value }))}
                  placeholder="e.g. next month"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div
            className="space-y-5"
            onChange={(ev) => {
              const t = ev.target as HTMLInputElement;
              if (!t.name) return;
              setContact((c) => ({ ...c, [t.name]: t.type === "checkbox" ? t.checked : t.value }));
            }}
          >
            <ContactFields errors={allErrors} defaults={contact} />
            <Field id="message" label="Anything else we should know?" error={err("message")}>
              <Textarea
                {...a11y("message", err("message"))}
                rows={3}
                defaultValue={contact.message}
              />
            </Field>
            <Honeypot />
            <ConsentField error={err("consent")} defaultChecked={contact.consent} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4" data-testid="quote-review">
            <h2 className="text-xl">Check your request</h2>
            <ReviewBlock title="Services" onEdit={() => setStep(0)}>
              {details.services.map((s) => SERVICE_NAMES[s]).join(", ")}
            </ReviewBlock>
            <ReviewBlock title="Project details" onEdit={() => setStep(1)}>
              <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
                {details.services.flatMap((slug) => {
                  const key = QUOTE_ANSWER_KEYS[slug];
                  return Object.entries((details[key] as Answers) ?? {})
                    .filter(
                      ([, v]) => v !== "" && v !== undefined && !(Array.isArray(v) && !v.length),
                    )
                    .map(([k, v]) => (
                      <div key={`${key}-${k}`} className="contents">
                        <dt className="text-muted">
                          {SERVICE_NAMES[slug]} · {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </dt>
                        <dd className="font-medium">
                          {Array.isArray(v)
                            ? v.join(", ")
                            : typeof v === "boolean"
                              ? v
                                ? "Yes"
                                : "No"
                              : String(v)}
                        </dd>
                      </div>
                    ));
                })}
                {details.budget ? (
                  <>
                    <dt className="text-muted">Budget</dt>
                    <dd className="font-medium">{details.budget}</dd>
                  </>
                ) : null}
                {details.timeline ? (
                  <>
                    <dt className="text-muted">Start</dt>
                    <dd className="font-medium">{details.timeline}</dd>
                  </>
                ) : null}
              </dl>
            </ReviewBlock>
            <ReviewBlock title="Contact" onEdit={() => setStep(2)}>
              {contact.name} · {contact.phone} · {contact.email}
              {contact.company ? ` · ${contact.company}` : ""}
            </ReviewBlock>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="submit" size="lg" data-testid="quote-next">
              Continue →
            </Button>
          ) : (
            <Button
              type="submit"
              size="lg"
              disabled={lead.status === "submitting"}
              data-testid="quote-submit"
            >
              {lead.status === "submitting" ? "Sending…" : "Send quote request"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function CheckGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const on = selected.includes(item);
          return (
            <label
              key={item}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                on
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-border hover:border-primary/50",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={on}
                onChange={() => onToggle(item)}
              />
              {item}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}
