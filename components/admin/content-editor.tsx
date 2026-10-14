"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveContentAction } from "@/app/admin/actions/content";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { kindConfig, type FieldDef } from "@/lib/admin/content-config";
import { cn, slugify } from "@/lib/utils";
import { fieldErrors } from "@/lib/validation/lead";
import { ImageInput, ImagesInput, type ImageValue } from "./image-field";

type Doc = Record<string, unknown>;

/** Errors under a field, with the field prefix removed ("faqs.0.q" -> "0.q"). */
function nested(errors: Record<string, string>, name: string) {
  return Object.fromEntries(
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`${name}.`))
      .map(([k, v]) => [k.slice(name.length + 1), v]),
  );
}

export function ContentEditor({
  kind,
  id,
  initial,
  serviceOptions = [],
}: {
  kind: string;
  id: string | null;
  initial: Doc;
  serviceOptions?: { id: string; title: string }[];
}) {
  const config = kindConfig(kind)!;
  const router = useRouter();
  const toast = useToast();
  const [doc, setDoc] = useState<Doc>(() => ({ ...config.defaults, ...initial }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [pending, start] = useTransition();

  const set = (name: string, value: unknown) =>
    setDoc((d) => {
      const next = { ...d, [name]: value };
      // Keep the slug in step with the title until it's edited by hand.
      const slugField = config.fields.find((f) => f.type === "slug" && f.from === name);
      if (slugField && !slugTouched) next[slugField.name] = slugify(String(value));
      return next;
    });

  function save() {
    setFormError(undefined);
    const parsed = config.schema.safeParse(doc);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setFormError("Please fix the highlighted fields.");
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(),
      );
      return;
    }
    setErrors({});
    start(async () => {
      const result = await saveContentAction(kind, id, JSON.stringify(doc));
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }
      toast(`${config.label} saved`);
      if (!id) router.replace(`/admin/content/${kind}/${result.id}`);
      else router.refresh();
    });
  }

  const publicPath = id && config.publicPath ? config.publicPath(doc) : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      <FormError message={formError} />
      <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6">
        {config.fields.map((field) => (
          <FieldControl
            key={field.name}
            field={field}
            value={doc[field.name]}
            onChange={(v) => {
              if (field.type === "slug") setSlugTouched(true);
              set(field.name, v);
            }}
            error={errors[field.name]}
            errors={nested(errors, field.name)}
            numeric={typeof config.defaults[field.name] === "number"}
            serviceOptions={serviceOptions}
          />
        ))}
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-bg-soft/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <Button type="submit" disabled={pending} data-testid="content-save">
          {pending ? "Saving…" : id ? "Save changes" : `Create ${config.label.toLowerCase()}`}
        </Button>
        <Link href={`/admin/content/${kind}`} className={buttonClass({ variant: "ghost" })}>
          Back to list
        </Link>
        {publicPath ? (
          <a
            href={publicPath}
            target="_blank"
            rel="noopener"
            className={buttonClass({ variant: "outline" }, "ml-auto")}
          >
            <Icon name="eye" className="size-4" /> View on site
          </a>
        ) : null}
      </div>
    </form>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  error,
  errors,
  numeric,
  serviceOptions,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  errors: Record<string, string>;
  numeric: boolean;
  serviceOptions: { id: string; title: string }[];
}) {
  const id = `f-${field.name}`;
  const inv = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
  const hint = "hint" in field ? field.hint : undefined;
  const wide =
    ["markdown", "image", "images", "list", "pairs", "process", "services", "seo"].includes(
      field.type,
    ) ||
    ("wide" in field && field.wide);

  switch (field.type) {
    case "text":
    case "url":
    case "date":
      return (
        <Field
          id={id}
          label={field.label}
          hint={hint}
          error={error}
          required={field.required}
          className={cn(wide && "sm:col-span-2")}
        >
          <Input
            {...inv}
            type={field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
            value={field.type === "date" ? String(value ?? "").slice(0, 10) : String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "slug":
      return (
        <Field
          id={id}
          label={field.label}
          hint="Lowercase letters, numbers and hyphens"
          error={error}
          required
        >
          <Input
            {...inv}
            value={String(value ?? "")}
            onChange={(e) => onChange(slugify(e.target.value) || e.target.value.toLowerCase())}
          />
        </Field>
      );
    case "textarea":
      return (
        <Field
          id={id}
          label={field.label}
          hint={hint}
          error={error}
          required={field.required}
          className={cn(wide && "sm:col-span-2")}
        >
          <Textarea
            {...inv}
            rows={3}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
    case "markdown":
      return (
        <MarkdownField
          id={id}
          label={field.label}
          value={String(value ?? "")}
          onChange={onChange}
          error={error}
        />
      );
    case "number":
      return (
        <Field id={id} label={field.label} hint={hint} error={error} required={field.required}>
          <Input
            {...inv}
            type="number"
            inputMode="numeric"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </Field>
      );
    case "boolean":
      return (
        <div className="flex items-center sm:col-span-2">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            label={
              <span>
                <strong>{field.label}</strong>
                {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
              </span>
            }
          />
        </div>
      );
    case "select":
      return (
        <Field id={id} label={field.label} error={error}>
          <Select
            {...inv}
            value={String(value ?? "")}
            onChange={(e) => onChange(numeric ? Number(e.target.value) : e.target.value)}
          >
            {field.options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "image":
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <ImageInput
            value={(value as ImageValue | null) ?? null}
            onChange={onChange}
            error={errors.alt ?? errors.url ?? error}
          />
        </fieldset>
      );
    case "images":
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <ImagesInput value={(value as ImageValue[]) ?? []} onChange={onChange} errors={errors} />
        </fieldset>
      );
    case "list": {
      const items = (value as string[]) ?? [];
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label={`${field.placeholder ?? "Item"} ${i + 1}`}
                  value={item}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <RowButtons
                  index={i}
                  length={items.length}
                  onMove={(to) => onChange(move(items, i, to))}
                  onRemove={() => onChange(items.filter((_, j) => j !== i))}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
              <Icon name="plus" className="size-4" /> Add{" "}
              {field.placeholder?.toLowerCase() ?? "item"}
            </Button>
          </div>
        </fieldset>
      );
    }
    case "pairs": {
      const rows = (value as Record<string, string>[]) ?? [];
      const [k1, k2] = field.keys;
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  aria-label={`${field.keyLabels[0]} ${i + 1}`}
                  placeholder={field.keyLabels[0]}
                  value={row[k1] ?? ""}
                  aria-invalid={errors[`${i}.${k1}`] ? true : undefined}
                  onChange={(e) =>
                    onChange(rows.map((r, j) => (j === i ? { ...r, [k1]: e.target.value } : r)))
                  }
                />
                {field.long ? (
                  <Textarea
                    rows={2}
                    aria-label={`${field.keyLabels[1]} ${i + 1}`}
                    placeholder={field.keyLabels[1]}
                    value={row[k2] ?? ""}
                    aria-invalid={errors[`${i}.${k2}`] ? true : undefined}
                    onChange={(e) =>
                      onChange(rows.map((r, j) => (j === i ? { ...r, [k2]: e.target.value } : r)))
                    }
                  />
                ) : (
                  <Input
                    aria-label={`${field.keyLabels[1]} ${i + 1}`}
                    placeholder={field.keyLabels[1]}
                    value={row[k2] ?? ""}
                    aria-invalid={errors[`${i}.${k2}`] ? true : undefined}
                    onChange={(e) =>
                      onChange(rows.map((r, j) => (j === i ? { ...r, [k2]: e.target.value } : r)))
                    }
                  />
                )}
                <RowButtons
                  index={i}
                  length={rows.length}
                  onMove={(to) => onChange(move(rows, i, to))}
                  onRemove={() => onChange(rows.filter((_, j) => j !== i))}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange([...rows, { [k1]: "", [k2]: "" }])}
            >
              <Icon name="plus" className="size-4" /> Add
            </Button>
          </div>
        </fieldset>
      );
    }
    case "process": {
      const steps = (value as { step: number; title: string; text: string }[]) ?? [];
      const renumber = (list: typeof steps) => list.map((s, i) => ({ ...s, step: i + 1 }));
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={i}
                className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[2rem_1fr_2fr_auto] sm:items-start"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent font-bold text-accent-fg">
                  {i + 1}
                </span>
                <Input
                  aria-label={`Step ${i + 1} title`}
                  placeholder="Title"
                  value={s.title}
                  onChange={(e) =>
                    onChange(steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                  }
                />
                <Textarea
                  rows={2}
                  aria-label={`Step ${i + 1} text`}
                  placeholder="Description"
                  value={s.text}
                  onChange={(e) =>
                    onChange(steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))
                  }
                />
                <RowButtons
                  index={i}
                  length={steps.length}
                  onMove={(to) => onChange(renumber(move(steps, i, to)))}
                  onRemove={() => onChange(renumber(steps.filter((_, j) => j !== i)))}
                />
              </li>
            ))}
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => onChange([...steps, { step: steps.length + 1, title: "", text: "" }])}
          >
            <Icon name="plus" className="size-4" /> Add step
          </Button>
        </fieldset>
      );
    }
    case "services": {
      const selected = (value as string[]) ?? [];
      return (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
          <div className="flex flex-wrap gap-3">
            {serviceOptions.map((s) => (
              <Checkbox
                key={s.id}
                label={s.title}
                checked={selected.includes(s.id)}
                onChange={(e) =>
                  onChange(
                    e.target.checked ? [...selected, s.id] : selected.filter((x) => x !== s.id),
                  )
                }
              />
            ))}
          </div>
        </fieldset>
      );
    }
    case "seo": {
      const seo = (value as Record<string, string>) ?? {};
      return (
        <fieldset className="grid gap-3 rounded-xl border border-border p-4 sm:col-span-2 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">{field.label}</legend>
          <Field
            id={`${id}-title`}
            label="SEO title"
            hint="Defaults to the title"
            error={errors.title}
          >
            <Input
              id={`${id}-title`}
              value={seo.title ?? ""}
              onChange={(e) => onChange({ ...seo, title: e.target.value })}
            />
          </Field>
          <Field id={`${id}-og`} label="Social image URL" error={errors.ogImage}>
            <Input
              id={`${id}-og`}
              value={seo.ogImage ?? ""}
              onChange={(e) => onChange({ ...seo, ogImage: e.target.value })}
            />
          </Field>
          <Field
            id={`${id}-desc`}
            label="SEO description"
            hint="Defaults to the summary (aim for 150–160 characters)"
            error={errors.description}
            className="sm:col-span-2"
          >
            <Textarea
              id={`${id}-desc`}
              rows={2}
              value={seo.description ?? ""}
              onChange={(e) => onChange({ ...seo, description: e.target.value })}
            />
          </Field>
        </fieldset>
      );
    }
  }
}

function MarkdownField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="sm:col-span-2">
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="text-sm font-semibold text-primary hover:underline"
          aria-pressed={preview}
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="min-h-40 rounded-lg border border-border bg-bg p-4">
          <Markdown>{value || "_Nothing to preview yet._"}</Markdown>
        </div>
      ) : (
        <Textarea
          id={id}
          rows={12}
          className="font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      )}
      <p className="mt-1 text-xs text-muted">
        **bold**, *italic*, ## headings, - lists, [links](https://…)
      </p>
      {error ? (
        <p className="mt-1 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RowButtons({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className="rounded-md p-2 hover:bg-bg-soft disabled:opacity-30"
        aria-label="Move up"
      >
        <Icon name="up" className="size-4" />
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(index + 1)}
        className="rounded-md p-2 hover:bg-bg-soft disabled:opacity-30"
        aria-label="Move down"
      >
        <Icon name="chevronDown" className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md p-2 text-danger hover:bg-danger/10"
        aria-label="Remove"
      >
        <Icon name="trash" className="size-4" />
      </button>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
