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
    userId: { type: Schema.Types.UUID, ref: "User", required: true },
    initialAmount: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    interestRate: { type: Number, required: true },
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
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "credits",
    versionKey: false,
  }
);
