import { Schema, Types } from "mongoose";
import { AccountInterface } from "../interface/AccountInterface";

export const AccountSchema = new Schema<AccountInterface>(
  {
    iban: { type: String, required: true, unique: true },
    owner: {
      type: {
        role: { type: String, enum: ["bank", "client"], required: true },
        userId: { type: String, required: false },
      },
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["courant", "epargne"], required: true },
    color: { type: String, required: true },
    balance: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "accounts",
    versionKey: false,
  }
);
