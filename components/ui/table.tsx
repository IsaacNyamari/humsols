import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table
        className={cn("w-full min-w-[640px] border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border bg-bg-soft px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("border-b border-border px-4 py-3 align-top", className)} {...props} />;
}
