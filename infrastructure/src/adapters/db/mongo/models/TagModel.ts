import mongoose from "mongoose";
import { TagSchema } from "../schema/TagSchema";
import { TagInterface } from "../interface/TagInterface";

export const TagModel =
  mongoose.models.Tag || mongoose.model<TagInterface>("Tag", TagSchema);
