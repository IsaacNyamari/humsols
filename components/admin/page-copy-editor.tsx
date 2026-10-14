"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetPageCopyAction, savePageCopyAction } from "@/app/admin/actions/content";
import { Icon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  COPY_ICONS,
  PAGES,
  pageSchema,
  type CopyField,
  type CopyItem,
  type PageKey,
} from "@/lib/page-content/registry";
import { fieldErrors } from "@/lib/validation/lead";

type Copy = Record<string, unknown>;

export function PageCopyEditor({ pageKey, initial }: { pageKey: PageKey; initial: Copy }) {
  const def = PAGES[pageKey];
  const router = useRouter();
  const toast = useToast();
  const [copy, setCopy] = useState<Copy>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [confirmReset, setConfirmReset] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = pageSchema(pageKey).safeParse(copy);
        if (!parsed.success) {
          setErrors(fieldErrors(parsed.error));
          setFormError("Please fix the highlighted fields.");
          return;
        }
        setErrors({});
        setFormError(undefined);
        start(async () => {
          const r = await savePageCopyAction(pageKey, JSON.stringify(copy));
          if (!r.ok) {
            setErrors(r.fieldErrors ?? {});
            setFormError(r.error);
          } else toast("Saved — the page updates immediately");
        });
      }}
    >
      <FormError message={formError} />
      <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        {def.fields.map((f) => (
          <CopyControl
            key={f.name}
            field={f}
            value={copy[f.name]}
            error={errors[f.name]}
            errors={errors}
            onChange={(v) => setCopy((c) => ({ ...c, [f.name]: v }))}
          />
        ))}
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-bg-soft/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save page text"}
        </Button>
        <Button variant="ghost" onClick={() => setConfirmReset(true)}>
          Restore defaults
        </Button>
        <a
          href={def.path}
          target="_blank"
          rel="noopener"
          className={buttonClass({ variant: "outline" }, "ml-auto")}
        >
          <Icon name="eye" className="size-4" /> View page
        </a>
      </div>
      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore the original text?"
      >
        <p className="text-sm text-muted">
          All edits to “{def.label}” will be replaced by the original launch text.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              start(async () => {
                await resetPageCopyAction(pageKey);
                setCopy({ ...(def.defaults as Copy) });
                setConfirmReset(false);
                toast("Original text restored");
                router.refresh();
              })
            }
          >
            Restore defaults
          </Button>
        </div>
      </Modal>
    </form>
  );
}

function CopyControl({
  field,
  value,
  error,
  errors,
  onChange,
}: {
  field: CopyField;
  value: unknown;
  error?: string;
  errors: Record<string, string>;
  onChange: (v: unknown) => void;
}) {
  const id = `copy-${field.name}`;
  const inv = { id, "aria-invalid": error ? true : undefined } as const;

  if (field.type === "text")
    return (
      <Field id={id} label={field.label} hint={field.hint} error={error}>
        <Input {...inv} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  if (field.type === "textarea")
    return (
      <Field id={id} label={field.label} hint={field.hint} error={error}>
        <Textarea
          {...inv}
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  if (field.type === "markdown")
    return (
      <MarkdownCopy id={id} label={field.label} value={String(value ?? "")} onChange={onChange} />
    );

  if (field.type === "list") {
    const items = (value as string[]) ?? [];
    return (
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label={`${field.label} ${i + 1}`}
                value={item}
                aria-invalid={errors[`${field.name}.${i}`] ? true : undefined}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button
                type="button"
                className="rounded-md p-2 text-danger hover:bg-danger/10"
                aria-label="Remove"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Icon name="trash" className="size-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
            <Icon name="plus" className="size-4" /> Add
          </Button>
        </div>
      </fieldset>
    );
  }

  const items = (value as CopyItem[]) ?? [];
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{field.label}</legend>
      {field.hint ? <p className="mb-2 text-xs text-muted">{field.hint}</p> : null}
      <div className="space-y-3">
        {items.map((item, i) => {
          const update = (patch: Partial<CopyItem>) =>
            onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
          return (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[9rem_1fr_2fr_auto] sm:items-start"
            >
              <Select
                aria-label={`Item ${i + 1} icon`}
                value={item.icon}
                onChange={(e) => update({ icon: e.target.value })}
              >
                {COPY_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </Select>
              <Input
                aria-label={`Item ${i + 1} title`}
                placeholder="Title"
                value={item.title}
                aria-invalid={errors[`${field.name}.${i}.title`] ? true : undefined}
                onChange={(e) => update({ title: e.target.value })}
              />
              <Textarea
                aria-label={`Item ${i + 1} text`}
                rows={2}
                placeholder="Text"
                value={item.text}
                onChange={(e) => update({ text: e.target.value })}
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  className="rounded-md p-2 hover:bg-bg-soft disabled:opacity-30"
                  aria-label="Move up"
                  onClick={() => {
                    const n = items.slice();
                    [n[i - 1], n[i]] = [n[i], n[i - 1]];
                    onChange(n);
                  }}
                >
                  <Icon name="up" className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-md p-2 text-danger hover:bg-danger/10"
                  aria-label="Remove"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                >
                  <Icon name="trash" className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, { icon: "check", title: "", text: "" }])}
        >
          <Icon name="plus" className="size-4" /> Add item
        </Button>
      </div>
    </fieldset>
  );
}

function MarkdownCopy({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
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
        <div className="rounded-lg border border-border bg-bg p-4">
          <Markdown>{value}</Markdown>
        </div>
      ) : (
        <Textarea
          id={id}
          rows={14}
          className="font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
