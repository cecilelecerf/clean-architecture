import { Types } from "mongoose";

export interface CreditInterface {
  _id: Types.UUID;
  accountId: Types.UUID;
  formuleCreditId: Types.UUID;
  initialAmount: {
    amount: number;
    currency: string;
  };
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
  status: "PENDING" | "ACCEPTED" | "REFUSED" | "COMPLETED";
  createdAt: Date;
  advisor?: Types.UUID | null;
  updatedAt: Date;
  reason?: string;
}
