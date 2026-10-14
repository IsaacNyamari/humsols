import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}
      {...props}
    />
  );
}

const badgeTones = {
  neutral: "bg-bg-soft text-muted border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/15 text-fg border-accent/40",
  success: "bg-success/10 text-success border-success/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  warning:
    "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-400/15 dark:text-amber-200 dark:border-amber-400/30",
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: { tone?: BadgeTone } & ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Visible marker on content that still needs real data. */
export function PlaceholderBadge({ className }: { className?: string }) {
  return (
    <Badge
      tone="warning"
      className={className}
      title="This is placeholder content to be replaced from the admin"
    >
      Placeholder
    </Badge>
  );
}
