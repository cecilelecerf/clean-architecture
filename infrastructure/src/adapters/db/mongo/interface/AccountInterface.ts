import { Document } from "mongoose";

export interface AccountInterface extends Document {
  iban: string;
  owner: {
    role: "bank" | "client";
    userId: string;
  };
  name: string;
  type: "courant" | "epargne";
  color: string;
  balance: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}