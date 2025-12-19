import { Types } from "mongoose";

export interface MessageInterface {
  threadId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  sentAt: Date;
  readBy: Types.ObjectId[];
}
