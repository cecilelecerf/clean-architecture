import { Types } from "mongoose";

export interface OrderInterface {
  _id: Types.UUID;
  userId: Types.UUID;
  actionId: Types.UUID;
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
