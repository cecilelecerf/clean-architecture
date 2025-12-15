import { Schema } from "mongoose";
import { OrderInterface } from "../interface/OrderInterface";

export const OrderSchema = new Schema<OrderInterface>(
  {
    userId: { type: String, required: true },
    actionId: { type: String, required: true },
    type: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true },
    price: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true
    },
    fee: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "executed", "cancelled"], required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "order",
    versionKey: false,
  }
);