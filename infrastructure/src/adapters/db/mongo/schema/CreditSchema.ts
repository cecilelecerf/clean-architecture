import { Schema, Types } from "mongoose";
import { CreditInterface } from "../interface/CreditInterface";

export const CreditSchema = new Schema<CreditInterface>(
  {
    _id: { type: String, required: true },
    accountId: { type: String, ref: "Account", required: true },
    formuleCreditId: { type: Types.UUID, ref: "Formule", required: true },
    initialAmount: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, length: 3 },
    },
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    monthlyPayment: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, length: 3 },
    },
    remainingBalance: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, length: 3 },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REFUSED", "COMPLETED"],
      required: true,
    },
    createdAt: { type: Date, required: true },
    advisor: { type: Types.UUID, ref: "User", required: false, default: null },
    updatedAt: { type: Date, required: true },
    reason: { type: String, required: false },
  },
  {
    collection: "credits",
    versionKey: false,
  }
);
