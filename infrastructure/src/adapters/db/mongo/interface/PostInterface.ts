import { Types } from "mongoose";

export interface PostInterface {
  _id: Types.UUID;
  advisorId: Types.UUID;
  title: string;
  content: string;
  tagsId: Types.UUID[];
  createdAt: Date;
  readBy: Types.UUID[];
  updatedAt: Date;
  publishedAt: Date;
  clientId: Types.UUID[];
}
