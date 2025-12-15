import { Schema } from "mongoose";
import { ThreadInterface } from "../interface/ThreadInterface";

export const ThreadSchema = new Schema<ThreadInterface>(
  {
    participantsId: { type: [String], required: true, default: [] },
    title: { type: String, required: true },
    isClose: {type: Boolean, required: true},
    type: {type: String, enum: ["external", "internal"], required: true},
    administratorId: { type: String, required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "threads",
    versionKey: false,
  }
);