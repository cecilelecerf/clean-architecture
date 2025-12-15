import mongoose from "mongoose";
import { TagSchema } from "../schema/TagSchema";
import { TagInterface } from "../interface/TagInterface";

export const TagModel =
  mongoose.models.tags ||
  mongoose.model<TagInterface>("tags", TagSchema);