import type { Metadata } from "next";
import { AdminPageTitle } from "@/components/admin/page-title";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireActor } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/services/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireActor("settings:write");
  const settings = await getSiteSettings();
  return (
    <>
      <AdminPageTitle
        title="Site settings"
        description="Company details, contacts and defaults used across the website and emails."
      />
      <SettingsForm initial={settings} />
    </>
  );
}
