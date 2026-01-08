import { Types } from "mongoose";

export interface TransactionInterface {
  _id: Types.UUID;
  label: string;
  icon?: string;
  fromAccountId: string;
  toAccountId: string;
  amount: {
    amount: number;
    currency: string;
  };
  date: Date;
}
