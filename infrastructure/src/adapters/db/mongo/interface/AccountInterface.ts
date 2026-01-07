import { Types } from "mongoose";

export interface AccountInterface {
  _id: Types.UUID;
  userId?: string | null;
  name: string;
  type: "courant" | "epargne";
  color:
    | "yellow"
    | "blue"
    | "purple"
    | "gray"
    | "orange"
    | "pink"
    | "red"
    | "green";
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
