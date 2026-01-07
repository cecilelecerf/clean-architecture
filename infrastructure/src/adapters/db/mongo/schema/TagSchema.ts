import { Schema, Types } from "mongoose";
import { TagInterface } from "../interface/TagInterface";

export const TagSchema = new Schema<TagInterface>(
  {
    _id: { type: Types.UUID, required: true },
    label: { type: String, required: true, maxlength: 50 },
    color: {
      type: String,
      enum: [
        "yellow",
        "blue",
        "purple",
        "gray",
        "orange",
        "pink",
        "red",
        "green",
      ],
      required: true,
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "tags",
    versionKey: false,
  }
);
