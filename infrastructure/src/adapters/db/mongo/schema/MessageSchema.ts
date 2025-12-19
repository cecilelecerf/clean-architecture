import { Schema, Types } from "mongoose";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageSchema = new Schema<MessageInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    threadId: { type: Schema.Types.UUID, ref: "Thread", required: true },
    senderId: { type: Schema.Types.UUID, ref: "User", required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, required: true },
    readBy: { type: [String], required: true, default: [] },
  },
  {
    collection: "messages",
    versionKey: false,
  }
);
