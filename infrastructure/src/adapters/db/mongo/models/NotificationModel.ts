import mongoose from "mongoose";
import { NotificationSchema } from "../schema/NotificationSchema";
import { NotificationInterface } from "../interface/NotificationInterface";

export const NotificationModel =
  mongoose.models.notifications || mongoose.model<NotificationInterface>("notifications", NotificationSchema);