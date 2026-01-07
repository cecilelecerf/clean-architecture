import { Schema, Types } from "mongoose";
import { OrderInterface } from "../interface/OrderInterface";

export const OrderSchema = new Schema<OrderInterface>(
  {
    _id: { type: Types.UUID, required: true },
    IBAN: { type: String, ref: "Account", required: true },
    ISIN: { type: String, ref: "Action", required: true },
    type: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true },
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: "EUR", length: 3 },
    },
    executionPrice: {
      amount: { type: Number, required: false },
      currency: { type: String, required: false, length: 3 },
    },
    date: { type: Date, required: false },
    transactionId: { type: Types.UUID, ref: "Transaction", required: false },
    status: {
      type: String,
      enum: ["pending", "executed", "cancelled"],
      required: true,
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "orders",
    versionKey: false,
  }
);

OrderSchema.index({ actionId: 1, status: 1 });
OrderSchema.index({ createdAt: 1 });
