import { Schema, Types } from "mongoose";
import { ThreadInterface } from "../interface/ThreadInterface";

export const ThreadSchema = new Schema<ThreadInterface>(
  {
    _id: { type: Types.UUID, required: true, unique: true, index: true },
    participantsId: [{ type: Types.UUID, ref: "User", required: true }],
    title: { type: String, required: true, maxlength: 50 },
    isClose: { type: Boolean, required: true, default: false },
    type: { type: String, enum: ["internal", "external"], required: true },
    administratorId: { type: Types.UUID, ref: "User", required: false },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "threads",
    versionKey: false,
  }
);
