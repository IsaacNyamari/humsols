import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-sm",
  accent: "bg-accent text-accent-fg hover:brightness-95 shadow-sm",
  outline: "border border-border bg-card text-fg hover:bg-bg-soft",
  ghost: "text-fg hover:bg-bg-soft",
  danger: "bg-danger text-white hover:brightness-110",
  light: "bg-white text-navy hover:bg-white/90",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonStyleProps = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export function buttonClass(
  { variant = "primary", size = "md" }: ButtonStyleProps = {},
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonStyleProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonStyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonA({
  variant,
  size,
  className,
  ...props
}: ButtonStyleProps & ComponentProps<"a">) {
  return <a className={buttonClass({ variant, size }, className)} {...props} />;
}
