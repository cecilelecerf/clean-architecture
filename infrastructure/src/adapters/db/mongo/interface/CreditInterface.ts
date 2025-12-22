import { Types } from "mongoose";

export interface CreditInterface {
  _id: Types.UUID;
  userId: Types.UUID;
  initialAmount: {
    amount: number;
    currency: string;
  };
  interestRate: number;
  insuranceRate: number;
  durationMonths: number;
  startDate: Date;
  monthlyPayment: {
    amount: number;
    currency: string;
  };
  remainingBalance: {
    amount: number;
    currency: string;
  };
  status: string;
  createdAt: Date;
  advisor: Types.UUID;
  updatedAt: Date;
}
