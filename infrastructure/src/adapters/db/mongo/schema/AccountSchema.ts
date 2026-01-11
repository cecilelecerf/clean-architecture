import { Schema, Types } from "mongoose";
import { AccountInterface } from "../interface/AccountInterface";

export const AccountSchema = new Schema<AccountInterface>(
  {
    _id: { type: String, required: true },
    userId: { type: Types.UUID, ref: "User", required: false, default: null },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["courant", "epargne", "pret"],
      required: true,
    },
    color: {
      type: String,
      enum: [
        "yellow",
        "blue",
        "purple",
        "gray",
        "orange",
        "pink",
        "red",
        "green",
      ],
      required: true,
    },
    balance: {
      type: {
        amount: { type: Number, required: true, default: 0 },
        currency: { type: String, required: true, length: 3 },
      },
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "accounts",
    versionKey: false,
  }
);
