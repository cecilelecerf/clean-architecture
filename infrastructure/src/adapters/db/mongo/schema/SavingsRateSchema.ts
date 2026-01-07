import { Schema, Types } from "mongoose";
import { SavingsRateInterface } from "../interface/SavingsRateInterface";

export const SavingsRateSchema = new Schema<SavingsRateInterface>(
  {
    _id: { type: Types.UUID, required: true, unique: true, index: true },
    rate: { type: Number, required: true },
    effectiveDate: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "savingsrates",
    versionKey: false,
  }
);
