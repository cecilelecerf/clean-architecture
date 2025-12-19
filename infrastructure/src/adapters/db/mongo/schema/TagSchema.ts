import { Schema, Types } from "mongoose";
import { TagInterface } from "../interface/TagInterface";

export const TagSchema = new Schema<TagInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    label: { type: String, required: true },
    color: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "tags",
    versionKey: false,
  }
);
