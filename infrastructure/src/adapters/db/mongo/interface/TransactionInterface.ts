import { Types } from "mongoose";

export interface TransactionInterface {
  label: string;
  icon: string;
  fromAccountId: Types.ObjectId;
  toAccountId: Types.ObjectId;
  amount: {
    amount: number;
    currency: string;
  };
  date: Date;
  type: "credit" | "debit";
}
