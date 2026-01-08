import mongoose from "mongoose";
import { PostSchema } from "../schema/PostSchema";
import { PostInterface } from "../interface/PostInterface";

export const PostModel =
  mongoose.models.Post || mongoose.model<PostInterface>("Post", PostSchema);
