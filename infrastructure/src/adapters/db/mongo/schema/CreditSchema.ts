import { Schema, Types } from "mongoose";
import { CreditInterface } from "../interface/CreditInterface";

export const CreditSchema = new Schema<CreditInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    accountId: { type: Schema.Types.UUID, ref: "Account", required: true },
    formuleCreditId: { type: Schema.Types.UUID, ref: "Formule", required: true },
    initialAmount: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    insuranceRate: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    monthlyPayment: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    remainingBalance: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REFUSED", "COMPLETED"], required: false },
    createdAt: { type: Date, required: true },
    advisor: { type: Schema.Types.UUID, ref: "User", required: false },
    updatedAt: { type: Date, required: false },
    reason: { type: String, required: false}
  },
  {
    collection: "credits",
    versionKey: false,
  }
);
