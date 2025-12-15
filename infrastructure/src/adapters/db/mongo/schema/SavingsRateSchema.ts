import { Schema } from "mongoose";
import { SavingsRateInterface } from "../interface/SavingsRateInterface";

export const SavingsRateSchema = new Schema<SavingsRateInterface>(
  {
    rate: { type: Number, required: true },
    effectiveDate: { type: Date, required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "savingsrate",
    versionKey: false,
  }
);