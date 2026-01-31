import { Schema, Types } from "mongoose";
import { MessageInterface } from "../interface/MessageInterface";

export const MessageSchema = new Schema<MessageInterface>(
  {
    _id: { type: Types.UUID, required: true },
    threadId: { type: Types.UUID, ref: "Thread", required: true },
    senderId: { type: Types.UUID, ref: "User", required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, required: true },
    readBy: [
      {
        userId: { type: Types.UUID, required: true, ref: "User" },
        readAt: { type: Date, required: true },
      },
    ],
  },
  {
    collection: "messages",
    versionKey: false,
  },
);

MessageSchema.index({ threadId: 1, sentAt: 1 });
MessageSchema.index({ "readBy.userId": 1 });
