import { Schema, type Types } from "mongoose";
import { getModel } from "./_helpers";

/** Edited page copy, keyed by page (see lib/page-content/registry.ts). */
export interface IPageContent {
  _id: Types.ObjectId;
  key: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const pageContentSchema = new Schema<IPageContent>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

export const PageContent = getModel<IPageContent>("PageContent", pageContentSchema);
