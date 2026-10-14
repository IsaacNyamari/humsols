import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import { assertCan, type Actor } from "@/lib/permissions";
import { toPlain } from "@/lib/utils";
import type { SettingsInput } from "@/lib/validation/content";
import { SiteSetting } from "@/models";
import { diff, writeAudit } from "./audit";

export type SiteSettings = Omit<SettingsInput, "seo" | "announcement"> & {
  seo: { title: string; description: string; ogImage?: string };
  announcement: { text: string; href?: string; active: boolean };
};

/** Real company contacts (from the brief). Used until settings are saved in the DB. */
export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "Human Solutions",
  shortName: "HumSols",
  tagline: "Human Solutions",
  phones: ["+254 725 742 737", "+254 711 777 992"],
  email: "info@humsols.com",
  whatsapp: "254725742737",
  address: "Westlands, Nairobi, Kenya",
  hours: "[PLACEHOLDER: opening hours, e.g. Mon–Fri 8:00–17:00, Sat 9:00–13:00]",
  mapEmbedUrl: "https://www.google.com/maps?q=Westlands,+Nairobi&output=embed",
  social: [],
  seo: {
    title: "Human Solutions (HumSols) — Software, websites, CCTV and internet in Nairobi",
    description:
      "HumSols builds web applications, custom software, billing systems and websites, and installs CCTV and internet for businesses and homes in Kenya.",
  },
  announcement: { text: "", active: false },
  notificationRecipients: env.leadNotifyTo,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  await connectDB();
  const doc = await SiteSetting.findOne({ key: "site" }).lean();
  if (!doc) return DEFAULT_SETTINGS;
  const plain = toPlain<
    SiteSettings & { _id?: string; key?: string; createdAt?: string; updatedAt?: string }
  >(doc);
  const { _id, key, createdAt, updatedAt, ...rest } = plain;
  void _id;
  void key;
  void createdAt;
  void updatedAt;
  return { ...DEFAULT_SETTINGS, ...rest };
}

export async function updateSiteSettings(actor: Actor, input: SettingsInput) {
  assertCan(actor, "settings:write");
  await connectDB();
  const before = await getSiteSettings();
  await SiteSetting.findOneAndUpdate(
    { key: "site" },
    { $set: { ...input, key: "site" } },
    { upsert: true },
  );
  await writeAudit(actor, "update", "SiteSetting", "site", diff(before, input));
}
