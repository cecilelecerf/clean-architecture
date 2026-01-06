import { Types } from "mongoose";

export interface ActionPriceHistoryInterface {
  _id: Types.UUID;
  isin: string;
  date: Date;
  price: number;
  volume: number;
}
