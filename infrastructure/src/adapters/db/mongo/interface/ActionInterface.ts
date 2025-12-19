import { Types } from "mongoose";

export interface ActionInterface {
  _id: Types.UUID;
  ISIN: string;
  name: string;
  totalNb: number;
  symbol: string;
  market: string;
  activitySector: string;
  currentPrice: {
    amount: number;
    currency: string;
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
