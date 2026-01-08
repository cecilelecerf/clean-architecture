import mongoose from "mongoose";
import { TransactionSchema } from "../schema/TransactionSchema";
import { TransactionInterface } from "../interface/TransactionInterface";

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<TransactionInterface>("Transaction", TransactionSchema);
