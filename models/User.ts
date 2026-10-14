import { Schema, type Types } from "mongoose";
import { ROLES, type Role } from "@/lib/constants";
import { getModel } from "./_helpers";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  lastLoginAt?: Date;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: "editor" },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
    resetTokenHash: { type: String, select: false, index: true, sparse: true },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = getModel<IUser>("User", userSchema);
