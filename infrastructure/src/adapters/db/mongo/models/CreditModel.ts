import mongoose from "mongoose";
import { CreditSchema } from "../schema/CreditSchema";
import { CreditInterface } from "../interface/CreditInterface";

export const CreditModel =
  mongoose.models.credits || mongoose.model<CreditInterface>("credits", CreditSchema);