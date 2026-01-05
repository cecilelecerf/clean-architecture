import mongoose from "mongoose";
import { CurrencyInterface } from "../interface/CurrencyInterface";
import { currencySchema } from "../schema/CurrencySchema";

export const CurrencyModel = mongoose.model<CurrencyInterface>(
  "Currency",
  currencySchema
);
