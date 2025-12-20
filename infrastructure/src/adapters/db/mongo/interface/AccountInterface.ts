import { Types } from "mongoose";

export interface AccountInterface {
  _id: Types.UUID;
  iban: string;
  userId: Types.UUID;
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
