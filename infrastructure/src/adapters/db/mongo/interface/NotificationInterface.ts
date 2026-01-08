import { Types } from "mongoose";

export interface NotificationInterface {
  _id: Types.UUID;
  advisorId: Types.UUID;
  clientId: Types.UUID;
  title: string;
  content: string;
  isRead: boolean;
  type: "info" | "alert" | "reminder";
  createdAt: Date;
  updatedAt: Date;
}
