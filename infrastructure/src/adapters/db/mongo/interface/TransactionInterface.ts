import { Types } from "mongoose";

export interface TransactionInterface {
  _id: Types.UUID;
  label: string;
  icon: string;
  fromAccountId: Types.UUID;
  toAccountId: Types.UUID;
  amount: {
    amount: number;
    currency: string;
  };
  date: Date;
  type: "credit" | "debit";
}
