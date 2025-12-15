import mongoose from "mongoose";
import { PostSchema } from "../schema/PostSchema";
import { PostInterface } from "../interface/PostInterface";

export const PostModel =
  mongoose.models.posts ||
  mongoose.model<PostInterface>("posts", PostSchema);