import mongoose from "mongoose";
import { ThreadSchema } from "../schema/ThreadSchema";
import { ThreadInterface } from "../interface/ThreadInterface";

export const ThreadModel =
  mongoose.models.threads ||
  mongoose.model<ThreadInterface>("threads", ThreadSchema);