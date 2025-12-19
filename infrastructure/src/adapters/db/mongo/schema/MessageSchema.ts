import { Schema } from "mongoose";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageSchema = new Schema<MessageInterface>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, required: true },
    readBy: { type: [String], required: true, default: [] },
  },
  {
    timestamps: false,
    collection: "messages",
    versionKey: false,
  }
);
