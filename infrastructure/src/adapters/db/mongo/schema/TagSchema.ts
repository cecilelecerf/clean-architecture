import { Schema } from "mongoose";
import { TagInterface } from "../interface/TagInterface";

export const TagSchema = new Schema<TagInterface>(
  {
    label: { type: String, required: true },
    color: { type: String, required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "tags",
    versionKey: false,
  }
);