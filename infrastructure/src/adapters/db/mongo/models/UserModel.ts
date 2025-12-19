import mongoose from "mongoose";
import { UserSchema } from "../schema/UserSchema";
import { UserInterface } from "../interface/UserInterface";

export const UserModel =
  mongoose.models.User || mongoose.model<UserInterface>("User", UserSchema);
