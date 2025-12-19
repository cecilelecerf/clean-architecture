import { Types } from "mongoose";

export interface OrderInterface {
  userId: Types.ObjectId;
  actionId: Types.ObjectId;
  type: "buy" | "sell";
  quantity: number;
  price: {
    amount: number;
    currency: string;
  };
  fee: {
    amount: number;
    currency: string;
  };
  date: Date;
  status: "pending" | "executed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
