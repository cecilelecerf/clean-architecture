import { Schema } from "mongoose";
import { UserInterface } from "../interface/UserInterface";

export const UserSchema = new Schema<UserInterface>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "conseiller", "directeur"],
      required: true,
    },
    isActiveField: { type: Boolean, required: true },
    confirmedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
    collection: "users",
    versionKey: false,
  }
);
