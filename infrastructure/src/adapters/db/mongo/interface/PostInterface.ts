import { Types } from "mongoose";

export interface PostInterface {
  _id: Types.UUID;
  advisorId: Types.UUID;
  title: string;
  content: string;
  tagsId: Types.UUID[];
  readBy: Types.UUID[];
  clientId?: Types.UUID;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
