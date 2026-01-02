import { Types } from "mongoose";

export interface FormuleCreditInterface {
  _id: Types.UUID;
  userId: Types.UUID;
  interestRate: number;
  insuranceRate: number;
  type: string;
  label: string;
  description: string;
  isActive: boolean;
  accountId: Types.UUID;
  createdAt: Date;
  minAmount: {
    amount: number;
    currency: string;
  };
  maxAmount: {
    amount: number;
    currency: string;
  };
  currency: string;
  updatedAt: Date;
}
