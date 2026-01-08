import { Types } from "mongoose";

export interface OrderInterface {
  _id: Types.UUID;
  IBAN: string;
  ISIN: string;
  type: "buy" | "sell";
  quantity: number;
  price: {
    amount: number;
    currency: string;
  };
  executionPrice?: {
    amount?: number;
    currency?: string;
  };
  date?: Date;
  transactionId?: Types.UUID;
  status: "pending" | "executed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
