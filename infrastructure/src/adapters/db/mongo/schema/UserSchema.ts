import { Schema, Types } from "mongoose";
import { UserInterface } from "../interface/UserInterface";

export const UserSchema = new Schema<UserInterface>(
  {
    _id: { type: Types.UUID, required: true },
    firstname: { type: String, required: true, maxlength: 50 },
    lastname: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, maxlength: 100 },
    passwordHash: { type: String, required: false, maxlength: 255 },
    role: {
      type: String,
      enum: ["client", "conseiller", "directeur"],
      required: true,
    },
    isActive: { type: Boolean, required: true, default: true },
    confirmedAt: { type: Date, required: false },
    phoneNumber: { type: String, required: false, maxlength: 20 },
    city: { type: String, required: false, maxlength: 100 },
    address: { type: String, required: false, maxlength: 255 },
    country: { type: String, required: false, maxlength: 100 },
    postalCode: { type: String, required: false, maxlength: 10 },
    sexe: { type: String, enum: ["girl", "boy", "other"], required: false },
    dateOfBirth: { type: Date, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: false },
  },
  {
    collection: "users",
    versionKey: false,
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
