import mongoose from "mongoose";
import { CurrencyInterface } from "../interface/CurrencyInterface";
import { CurrencySchema } from "../schema/CurrencySchema";

export const CurrencyModel =
  mongoose.models.Currency ||
  mongoose.model<CurrencyInterface>("Currency", CurrencySchema);
