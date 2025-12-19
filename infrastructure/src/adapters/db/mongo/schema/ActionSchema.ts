import { Schema, Types } from "mongoose";
import { ActionInterface } from "../interface/ActionInterface";

export const ActionSchema = new Schema<ActionInterface>(
  {
    ISIN: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    totalNb: { type: Number, required: true },
    symbol: { type: String, required: true },
    market: { type: String, required: true },
    activitySector: { type: String, required: true },
    currentPrice: {
      type: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
      required: true,
    },
    isAvailable: { type: Boolean, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "actions",
    versionKey: false,
  }
);
