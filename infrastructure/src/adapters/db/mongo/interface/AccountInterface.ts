import { Types } from "mongoose";

export interface AccountInterface {
  _id: string;
  userId?: Types.UUID | null;
  name: string;
  type: "courant" | "epargne" | "pret";
  color:
    | "yellow"
    | "blue"
    | "purple"
    | "gray"
    | "orange"
    | "pink"
    | "red"
    | "green";
  balance: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
