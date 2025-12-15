import mongoose from "mongoose";
import { AccountSchema } from "../schema/AccountSchema";
import { AccountInterface } from "../interface/AccountInterface";

export const AccountModel =
  mongoose.models.accounts ||
  mongoose.model<AccountInterface>("accounts", AccountSchema);
