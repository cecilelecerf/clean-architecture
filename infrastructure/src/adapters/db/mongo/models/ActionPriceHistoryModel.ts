import mongoose from "mongoose";
import { ActionPriceHistoryInterface } from "../interface/ActionPriceHistoryInterface";
import { ActionPriceHistorySchema } from "../schema/ActionPriceHistorySchema";

export const ActionPriceHistoryModel =
  mongoose.models.ActionPriceHistory ||
  mongoose.model<ActionPriceHistoryInterface>(
    "ActionPriceHistory",
    ActionPriceHistorySchema
  );
