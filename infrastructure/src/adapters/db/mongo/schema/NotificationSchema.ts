import { Schema, Types } from "mongoose";
import { NotificationInterface } from "../interface/NotificationInterface";

export const NotificationSchema = new Schema<NotificationInterface>(
  {
    _id: { type: Types.UUID, required: true, unique: true, index: true },
    advisorId: { type: Types.UUID, ref: "User", required: true },
    clientId: { type: Types.UUID, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 150 },
    content: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    type: { type: String, enum: ["info", "alert", "reminder"], required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "notifications",
    versionKey: false,
  }
);
