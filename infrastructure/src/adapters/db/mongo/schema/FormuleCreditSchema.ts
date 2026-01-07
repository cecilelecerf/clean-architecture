import { Schema, Types } from "mongoose";
import { FormuleCreditInterface } from "../interface/FormuleCreditInterface";

export const FormuleCreditSchema = new Schema<FormuleCreditInterface>(
  {
    _id: { type: Types.UUID, required: true },
    interestRate: { type: Number, required: true },
    insuranceRate: { type: Number, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    accountId: { type: String, ref: "Account", required: true },
    createdAt: { type: Date, required: true },
    minAmount: {
      amount: { type: Number, required: false, default: 0 },
      currency: { type: String, required: false, length: 3 },
    },
    maxAmount: {
      amount: { type: Number, required: false, default: 0 },
      currency: { type: String, required: false, length: 3 },
    },
    currency: { type: String, required: false, length: 3 },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "formules",
    versionKey: false,
  }
);
