import { Schema, Types } from "mongoose";
import { PostInterface } from "../interface/PostInterface";

export const PostSchema = new Schema<PostInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    advisorId: { type: Schema.Types.UUID, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tagsId: { type: [String], required: true, default: [] },
    readBy: { type: [String], required: true, default: [] },
    publishedAt: { type: Date, required: false },
    clientId: { type: [String], required: false, default: [] },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "posts",
    versionKey: false,
  }
);
