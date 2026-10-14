import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-base text-fg placeholder:text-muted/70 shadow-sm transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-danger sm:text-sm";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 5, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(control, "min-h-24", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-11 appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7a90' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/** Label + control + hint + error, wired up with ids for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-fg">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Props to spread on a control inside <Field> so errors are announced. An id may
 * carry a "prefix--" (two forms on one page); the field name drops the prefix.
 */
export function a11y(id: string, error?: string, hint?: boolean) {
  return {
    id,
    name: id.includes("--") ? id.slice(id.indexOf("--") + 2) : id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function Checkbox({
  label,
  className,
  ...props
}: { label: ReactNode } & ComponentProps<"input">) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 rounded border-border accent-[var(--primary)]"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </div>
  );
}
