import { Schema } from "mongoose";
import { CurrencyInterface } from "../interface/CurrencyInterface";

export const CurrencySchema = new Schema<CurrencyInterface>(
  {
    _id: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
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
      required: false,
    },
  },
  {
    collection: "currencies",
    versionKey: false,
  }
);
