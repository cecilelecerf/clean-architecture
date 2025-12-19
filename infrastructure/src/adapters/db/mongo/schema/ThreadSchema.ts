import { Schema } from "mongoose";
import { ThreadInterface } from "../interface/ThreadInterface";

export const ThreadSchema = new Schema<ThreadInterface>(
  {
    participantsId: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    title: { type: String, required: true },
    isClose: { type: Boolean, required: true },
    type: { type: String, enum: ["external", "internal"], required: true },
    administratorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "threads",
    versionKey: false,
  }
);
