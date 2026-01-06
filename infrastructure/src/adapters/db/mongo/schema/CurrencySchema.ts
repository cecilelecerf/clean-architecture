import { Schema } from "mongoose";
import { CurrencyInterface } from "../interface/CurrencyInterface";

export const currencySchema = new Schema<CurrencyInterface>({
  _id: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3,
    index: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
});

currencySchema.index({ code: 1 });
