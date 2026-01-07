import { Schema, Types } from "mongoose";
import { TransactionInterface } from "../interface/TransactionInterface";

export const TransactionSchema = new Schema<TransactionInterface>(
  {
    _id: { type: Types.UUID, required: true },
    label: { type: String, required: true, maxlength: 40 },
    icon: { type: String, required: false, maxlength: 5 },
    fromAccountId: { type: String, ref: "Account", required: true },
    toAccountId: { type: String, ref: "Account", required: true },
    amount: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, length: 3 },
    },
    date: { type: Date, required: true },
  },
  {
    collection: "transactions",
    versionKey: false,
  }
);
