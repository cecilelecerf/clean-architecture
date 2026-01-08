import mongoose from "mongoose";
import { MessageSchema } from "../schema/MessageSchema";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageModel =
  mongoose.models.Message ||
  mongoose.model<MessageInterface>("Message", MessageSchema);
