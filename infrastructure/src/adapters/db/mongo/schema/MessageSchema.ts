import { Schema } from "mongoose";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageSchema = new Schema<MessageInterface>(
  {
    threadId: { type: String, required: true },
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, required: true },
    readBy: { type: [String], required: true, default: [] },
  },
  {
    timestamps: false,
    collection: "message",
    versionKey: false,
  }
);