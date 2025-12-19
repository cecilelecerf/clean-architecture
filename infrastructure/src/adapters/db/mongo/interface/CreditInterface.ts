import { Types } from "mongoose";

export interface CreditInterface {
  userId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}
