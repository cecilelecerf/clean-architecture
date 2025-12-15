import { Schema } from "mongoose";
import { TransactionInterface } from "../interface/TransactionInterface";

export const TransactionSchema = new Schema<TransactionInterface>(
  {
    label: { type: String, required: true },
    icon: { type: String, required: true },
    fromAccountId: { type: String, required: true },
    toAccountId: { type: String, required: true },
    amount: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true
    },
    type: { type: String, enum: ["credit", "debit"], required: true },
    date: { type: Date, required: true },
  },
  {
    timestamps: false,
    collection: "transaction",
    versionKey: false,
  }
);