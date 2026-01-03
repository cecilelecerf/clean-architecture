import { Schema, Types } from "mongoose";
import { FormuleCreditInterface } from "../interface/FormuleCreditInterface";

export const FormuleCreditSchema = new Schema<FormuleCreditInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    interestRate: { type: Number, required: true },
    insuranceRate: { type: Number, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, required: true },
    accountId: { type: Schema.Types.UUID, ref: "Account", required: true },
    createdAt: { type: Date, required: true },
    minAmount : {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: false,
    },
    maxAmount : {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: false,
    },
    currency: { type: String, required: false },
    updatedAt: { type: Date, required: false },
  },
  {
    collection: "formules",
    versionKey: false,
  }
);
