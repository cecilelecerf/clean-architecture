import { Schema, Types } from "mongoose";
import { ThreadInterface } from "../interface/ThreadInterface";

export const ThreadSchema = new Schema<ThreadInterface>(
  {
    _id: {
      type: Types.UUID,
      required: true,
      unique: true,
      index: true,
    },
    participantsId: [{ type: Schema.Types.UUID, ref: "User", required: true }],
    title: { type: String, required: true },
    isClose: { type: Boolean, required: true },
    type: { type: String, enum: ["external", "internal"], required: true },
    administratorId: {
      type: Schema.Types.UUID,
      ref: "User",
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "threads",
    versionKey: false,
  }
);
