import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Full logo; swaps to the brighter variant in dark mode (or always, with onDark). */
export function Logo({
  className,
  onDark = false,
  href = "/",
}: {
  className?: string;
  onDark?: boolean;
  href?: string | null;
}) {
  const img = (
    <>
      <Image
        src="/brand/humsols-logo.png"
        alt="Human Solutions"
        width={868}
        height={184}
        loading="eager"
        className={cn("h-9 w-auto", onDark ? "hidden" : "dark:hidden", className)}
      />
      <Image
        src="/brand/humsols-logo-dark.png"
        alt="Human Solutions"
        width={868}
        height={184}
        loading="eager"
        className={cn("h-9 w-auto", onDark ? "block" : "hidden dark:block", className)}
      />
    </>
  );
  if (href === null) return <span className="inline-flex">{img}</span>;
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center"
      aria-label="Human Solutions — home"
    >
      {img}
    </Link>
  );
}
