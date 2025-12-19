import { Schema } from "mongoose";
import { NotificationInterface } from "../interface/NotificationInterface";

export const NotificationSchema = new Schema<NotificationInterface>(
  {
    advisorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, required: true },
    type: { type: String, enum: ["info", "alert", "reminder"], required: true },
  },
  {
    timestamps: true,
    collection: "notifications",
    versionKey: false,
  }
);
