import { Schema } from "mongoose";
import { AccountInterface } from "../interface/AccountInterface";

export const AccountSchema = new Schema<AccountInterface>(
  {
    iban: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["courant", "epargne"], required: true },
    color: { type: String, required: true },
    balance: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "account",
    versionKey: false,
  }
);