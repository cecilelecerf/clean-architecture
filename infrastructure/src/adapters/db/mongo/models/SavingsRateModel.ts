import mongoose from "mongoose";
import { SavingsRateSchema } from "../schema/SavingsRateSchema";
import { SavingsRateInterface } from "../interface/SavingsRateInterface";

export const SavingsRateModel =
  mongoose.models.savingsrate ||
  mongoose.model<SavingsRateInterface>("savingsrate", SavingsRateSchema);