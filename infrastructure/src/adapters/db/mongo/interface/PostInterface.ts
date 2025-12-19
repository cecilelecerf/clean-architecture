import { Types } from "mongoose";

export interface PostInterface {
  advisorId: Types.ObjectId;
  title: string;
  content: string;
  tagsId: Types.ObjectId[];
  createdAt: Date;
  readBy: Types.ObjectId[];
  updatedAt: Date;
  publishedAt: Date;
  clientId: Types.ObjectId[];
}
