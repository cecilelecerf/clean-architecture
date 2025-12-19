import mongoose from "mongoose";
import { AccountSchema } from "../schema/AccountSchema";
import { AccountInterface } from "../interface/AccountInterface";

export const AccountModel =
  mongoose.models.Account ||
  mongoose.model<AccountInterface>("Account", AccountSchema);
