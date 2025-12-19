import { Types } from "mongoose";

export interface AccountInterface {
  _id: Types.UUID;
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
