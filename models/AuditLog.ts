import { Schema, type Types } from "mongoose";
import { getModel } from "./_helpers";

export interface IAuditLog {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  at: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  userName: String,
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: String,
  changes: Schema.Types.Mixed,
  at: { type: Date, default: Date.now },
});
auditLogSchema.index({ at: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, at: -1 });

export const AuditLog = getModel<IAuditLog>("AuditLog", auditLogSchema);
