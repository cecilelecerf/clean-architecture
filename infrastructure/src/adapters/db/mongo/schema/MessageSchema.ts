import { Schema, Types } from "mongoose";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageSchema = new Schema<MessageInterface>(
  {
    _id: { type: Types.UUID, required: true },
    threadId: { type: Types.UUID, ref: "Thread", required: true },
    senderId: { type: Types.UUID, ref: "User", required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, required: true },
    readBy: { type: [Types.UUID], required: true, default: [] },
  },
  {
    collection: "messages",
    versionKey: false,
  }
);
