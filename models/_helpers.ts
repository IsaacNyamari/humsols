import mongoose, { Schema, type Model } from "mongoose";

/** Reuse a compiled model across hot reloads. */
export function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

export type ImageRef = { url: string; alt: string };

export const imageSchema = new Schema<ImageRef>(
  { url: { type: String, required: true }, alt: { type: String, required: true, maxlength: 300 } },
  { _id: false },
);

export type Seo = { title?: string; description?: string; ogImage?: string };

export const seoSchema = new Schema<Seo>(
  {
    title: { type: String, maxlength: 120 },
    description: { type: String, maxlength: 300 },
    ogImage: String,
  },
  { _id: false },
);
