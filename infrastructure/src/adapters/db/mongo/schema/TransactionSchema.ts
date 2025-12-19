import { Schema, Types } from "mongoose";
import { TransactionInterface } from "../interface/TransactionInterface";

export const TransactionSchema = new Schema<TransactionInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    fromAccountId: {
      type: Schema.Types.UUID,
      ref: "Account",
      required: true,
    },
    toAccountId: {
      type: Schema.Types.UUID,
      ref: "Account",
      required: true,
    },
    amount: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    type: { type: String, enum: ["credit", "debit"], required: true },
    date: { type: Date, required: true },
  },
  {
    collection: "transactions",
    versionKey: false,
  }
);
