import { Schema, Types } from "mongoose";
import { OrderInterface } from "../interface/OrderInterface";

export const OrderSchema = new Schema<OrderInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.UUID, ref: "User", required: true },
    actionId: { type: Schema.Types.UUID, ref: "Action", required: true },
    type: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true },
    price: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    fee: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    date: { type: Date, required: true },
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
