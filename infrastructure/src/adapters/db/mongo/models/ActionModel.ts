import mongoose from "mongoose";
import { ActionInterface } from "../interface/ActionInterface";
import { ActionSchema } from "../schema/ActionSchema";

export const ActionModel =
  mongoose.models.actions ||
  mongoose.model<ActionInterface>("actions", ActionSchema);