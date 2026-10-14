import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireActor } from "@/lib/auth/session";

// Everything in the admin depends on the signed-in user, so it is rendered per
// request and allowed to block on navigation.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: React.ReactNode }) {
  const actor = await requireActor("dashboard:view");
  return (
    <div className="min-h-dvh bg-bg-soft lg:flex">
      <AdminSidebar user={{ name: actor.name, email: actor.email, role: actor.role }} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="min-h-dvh bg-bg-soft lg:flex" aria-busy="true">
      <div className="hidden w-64 border-r border-border bg-card lg:block" />
      <div className="flex-1 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}
