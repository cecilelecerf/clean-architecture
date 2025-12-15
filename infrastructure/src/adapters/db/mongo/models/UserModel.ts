import mongoose from "mongoose";
import { UserSchema } from "../schema/UserSchema";
import { UserInterface } from "../interface/UserInterface";

export const UserModel =
  mongoose.models.users ||
  mongoose.model<UserInterface>("users", UserSchema);