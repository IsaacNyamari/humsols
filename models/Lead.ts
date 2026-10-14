import { Schema, type Types } from "mongoose";
import { LEAD_STATUSES, LEAD_TYPES, type LeadStatus, type LeadType } from "@/lib/constants";
import { getModel } from "./_helpers";

export type EmailLogEntry = {
  kind: "notification" | "auto_reply";
  to: string;
  status: "sent" | "failed";
  error?: string;
  at: Date;
};

export interface ILead {
  _id: Types.ObjectId;
  type: LeadType;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  services: string[];
  message?: string;
  details: Record<string, unknown>;
  sourcePage?: string;
  utm?: Record<string, string>;
  status: LeadStatus;
  assignedTo?: Types.ObjectId | null;
  notes: { by?: Types.ObjectId; byName?: string; text: string; at: Date }[];
  ip?: string;
  userAgent?: string;
  consent: { given: boolean; at: Date };
  emailLog: EmailLogEntry[];
  emailFailed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    type: { type: String, enum: LEAD_TYPES, required: true },
    reference: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    company: { type: String, trim: true, maxlength: 160 },
    services: { type: [String], default: [] },
    message: { type: String, maxlength: 5000 },
    details: { type: Schema.Types.Mixed, default: {} },
    sourcePage: { type: String, maxlength: 300 },
    utm: { type: Schema.Types.Mixed },
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: {
      type: [
        new Schema(
          {
            by: { type: Schema.Types.ObjectId, ref: "User" },
            byName: String,
            text: { type: String, required: true, maxlength: 5000 },
            at: { type: Date, default: Date.now },
          },
          { _id: true },
        ),
      ],
      default: [],
    },
    ip: String,
    userAgent: { type: String, maxlength: 500 },
    consent: {
      given: { type: Boolean, required: true },
      at: { type: Date, required: true },
    },
    emailLog: {
      type: [
        new Schema(
          {
            kind: { type: String, enum: ["notification", "auto_reply"] },
            to: String,
            status: { type: String, enum: ["sent", "failed"] },
            error: String,
            at: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    emailFailed: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false },
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ type: 1, status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ services: 1 });
leadSchema.index({
  name: "text",
  email: "text",
  company: "text",
  reference: "text",
  message: "text",
});

export const Lead = getModel<ILead>("Lead", leadSchema);

// Atomic per-key sequence used for human-readable references (HS-Q-2026-0001).
export interface ICounter {
  _id: string;
  seq: number;
}
const counterSchema = new Schema<ICounter>({ _id: String, seq: { type: Number, default: 0 } });
export const Counter = getModel<ICounter>("Counter", counterSchema);
