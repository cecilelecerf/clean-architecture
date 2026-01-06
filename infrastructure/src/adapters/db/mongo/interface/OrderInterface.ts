import { Types } from "mongoose";

export interface OrderInterface {
  _id: Types.UUID;
  userId: Types.UUID;
  actionId: string;
  type: "buy" | "sell";
  quantity: number;
  price: {
    amount: number;
    currency: string;
  };
  date: Date;
  status: "pending" | "executed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
