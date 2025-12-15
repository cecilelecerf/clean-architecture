import { Schema } from "mongoose";
import { PostInterface } from "../interface/PostInterface";

export const PostSchema = new Schema<PostInterface>(
  {
    advisorId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tagsId: { type: [String], required: true, default: [] },
    readBy: { type: [String], required: true, default: [] },
    publishedAt: { type: Date, required: false},
    clientId: { type: [String], required: false, default: [] },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    collection: "post",
    versionKey: false,
  }
);