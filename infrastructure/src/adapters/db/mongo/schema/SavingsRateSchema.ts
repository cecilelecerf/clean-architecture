import { Schema } from "mongoose";
import { SavingsRateInterface } from "../interface/SavingsRateInterface";

export const SavingsRateSchema = new Schema<SavingsRateInterface>(
  {
    rate: { type: Number, required: true },
    effectiveDate: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: "savingsrates",
    versionKey: false,
  }
);
