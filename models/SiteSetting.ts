import { Schema, type Types } from "mongoose";
import { getModel } from "./_helpers";

export interface ISiteSetting {
  _id: Types.ObjectId;
  key: "site";
  companyName: string;
  shortName: string;
  tagline: string;
  phones: string[];
  email: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapEmbedUrl: string;
  social: { label: string; url: string }[];
  seo: { title: string; description: string; ogImage?: string };
  announcement: { text: string; href?: string; active: boolean };
  notificationRecipients: string[];
  verification: { google: string; bing: string };
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, enum: ["site"], default: "site", unique: true },
    companyName: { type: String, required: true },
    shortName: { type: String, default: "HumSols" },
    tagline: { type: String, default: "Human Solutions" },
    phones: { type: [String], default: [] },
    email: { type: String, required: true },
    whatsapp: { type: String, default: "" },
    address: { type: String, default: "" },
    hours: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    social: {
      type: [new Schema({ label: String, url: String }, { _id: false })],
      default: [],
    },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      ogImage: String,
    },
    announcement: {
      text: { type: String, default: "" },
      href: String,
      active: { type: Boolean, default: false },
    },
    notificationRecipients: { type: [String], default: [] },
    verification: {
      google: { type: String, default: "" },
      bing: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const SiteSetting = getModel<ISiteSetting>("SiteSetting", siteSettingSchema);
