"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export type ImageValue = { url: string; alt: string };

async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url;
}

/** Upload one image; alt text is required before it can be saved. */
export function ImageInput({
  value,
  onChange,
  error,
}: {
  value: ImageValue | null;
  onChange: (v: ImageValue | null) => void;
  error?: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  return (
    <div className="space-y-2">
      {value?.url ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-soft p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
          <img src={value.url} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
          <div className="flex-1 space-y-1">
            <label htmlFor={`${id}-alt`} className="text-xs font-semibold">
              Alt text (describe the image) <span className="text-danger">*</span>
            </label>
            <Input
              id={`${id}-alt`}
              value={value.alt}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              aria-invalid={error ? true : undefined}
              placeholder="e.g. Technician installing a dome camera at an office entrance"
            />
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted hover:text-danger"
            aria-label="Remove image"
            onClick={() => onChange(null)}
          >
            <Icon name="trash" className="size-4" />
          </button>
        </div>
      ) : null}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-semibold hover:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
        <Icon name="plus" className="size-4" />{" "}
        {busy ? "Uploading…" : value?.url ? "Replace image" : "Upload image"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            setUploadError(undefined);
            try {
              const url = await upload(file);
              onChange({ url, alt: value?.alt ?? "" });
            } catch (err) {
              setUploadError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {uploadError || error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {uploadError ?? error}
        </p>
      ) : null}
    </div>
  );
}

export function ImagesInput({
  value,
  onChange,
  errors,
}: {
  value: ImageValue[];
  onChange: (v: ImageValue[]) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {value.map((img, i) => (
        <div key={`${img.url}-${i}`} className="flex items-start gap-2">
          <div className="flex-1">
            <ImageInput
              value={img}
              error={errors[`${i}.alt`] ?? errors[`${i}.url`]}
              onChange={(v) =>
                onChange(
                  v ? value.map((x, j) => (j === i ? v : x)) : value.filter((_, j) => j !== i),
                )
              }
            />
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { url: "", alt: "" }])}
      >
        <Icon name="plus" className="size-4" /> Add image
      </Button>
    </div>
  );
}
