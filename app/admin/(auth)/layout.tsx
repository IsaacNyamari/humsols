import { Logo } from "@/components/site/logo";

export default function AuthLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-bg-soft px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
