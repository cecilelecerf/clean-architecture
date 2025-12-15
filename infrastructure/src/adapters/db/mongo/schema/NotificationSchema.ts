import { Schema } from "mongoose";
import { NotificationInterface } from "../interface/NotificationInterface";

export const NotificationSchema = new Schema<NotificationInterface>(
  {
    advisorId: { type: String, required: true },
    clientId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, required: true },
    type: { type: String, enum: ["info", "alert", "reminder"], required: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "notification",
    versionKey: false,
  }
);