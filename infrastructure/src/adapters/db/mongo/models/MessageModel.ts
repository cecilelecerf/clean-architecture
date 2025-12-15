import mongoose from "mongoose";
import { MessageSchema } from "../schema/MessageSchema";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageModel =
  mongoose.models.messages || mongoose.model<MessageInterface>("messages", MessageSchema);