"use client";

import { useState } from "react";
import { fieldErrors, leadSubmissionSchema } from "@/lib/validation/lead";
import type { LeadType } from "@/lib/constants";

type Status = "idle" | "submitting" | "success";

function utmParams() {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    for (const [k, v] of params) if (k.startsWith("utm_") && v) out[k] = v.slice(0, 200);
  } catch {}
  return Object.keys(out).length ? out : undefined;
}

/**
 * Shared submit logic for every public form: validates with the same Zod schema
 * the server uses, posts to /api/leads and exposes field errors by dotted path.
 */
export function useLeadForm(type: LeadType) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [reference, setReference] = useState<string>();

  async function submit(payload: Record<string, unknown>) {
    setFormError(undefined);
    const body = { ...payload, type, sourcePage: window.location.pathname, utm: utmParams() };
    const parsed = leadSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setFormError("Please check the highlighted fields.");
      focusFirstError();
      return false;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (res.ok && data.reference) {
        setReference(data.reference);
        setStatus("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      }
      setErrors(data.fieldErrors ?? {});
      setFormError(data.error ?? "Something went wrong. Please try again, or call us.");
      focusFirstError();
    } catch {
      setFormError(
        "We couldn't reach the server. Check your connection and try again, or call us.",
      );
    }
    setStatus("idle");
    return false;
  }

  function reset() {
    setStatus("idle");
    setReference(undefined);
    setErrors({});
    setFormError(undefined);
  }

  return { status, errors, formError, reference, submit, reset, setErrors };
}

function focusFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
    el?.focus();
  });
}

export function numberOrUndefined(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}
