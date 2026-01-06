import { Schema } from "mongoose";

export const ActionPriceHistorySchema = new Schema({
  isin: {
    type: String,
    required: true,
    ref: "Action",
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  },
});
