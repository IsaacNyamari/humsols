import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center"
    >
      <Logo />
      <p className="mt-10 text-sm font-bold tracking-widest text-primary uppercase">Error 404</p>
      <h1 className="mt-3 text-3xl sm:text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-md text-muted">
        The link may be old or mistyped. Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass()}>
          Home
        </Link>
        <Link href="/services" className={buttonClass({ variant: "outline" })}>
          Services
        </Link>
        <Link href="/contact" className={buttonClass({ variant: "outline" })}>
          Contact us
        </Link>
      </div>
    </main>
  );
}
