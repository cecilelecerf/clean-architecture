import { Types } from "mongoose";

export interface MessageInterface {
  _id: Types.UUID;
  threadId: Types.UUID;
  senderId: Types.UUID;
  content: string;
  sentAt: Date;
  readBy: { userId: Types.UUID; readAt: Date }[];
}
