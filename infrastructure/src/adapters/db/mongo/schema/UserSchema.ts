import { Schema, Types } from "mongoose";
import { UserInterface } from "../interface/UserInterface";

export const UserSchema = new Schema<UserInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "conseiller", "directeur"],
      required: true,
    },
    isActive: { type: Boolean, required: true },
    confirmedAt: { type: Date, required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "users",
    versionKey: false,
  }
);
