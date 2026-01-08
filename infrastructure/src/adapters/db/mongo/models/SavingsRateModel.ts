import mongoose from "mongoose";
import { SavingsRateSchema } from "../schema/SavingsRateSchema";
import { SavingsRateInterface } from "../interface/SavingsRateInterface";

export const SavingsRateModel =
  mongoose.models.SavingsRate ||
  mongoose.model<SavingsRateInterface>("SavingsRate", SavingsRateSchema);
