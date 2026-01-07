import { Schema, Types } from "mongoose";
import { PostInterface } from "../interface/PostInterface";

export const PostSchema = new Schema<PostInterface>(
  {
    _id: { type: Types.UUID, required: true },
    advisorId: { type: Types.UUID, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true },
    tagsId: { type: [Types.UUID], required: true, default: [] },
    readBy: { type: [Types.UUID], required: true, default: [] },
    publishedAt: { type: Date, required: false },
    clientId: { type: Types.UUID, ref: "User", required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "posts",
    versionKey: false,
  }
);
