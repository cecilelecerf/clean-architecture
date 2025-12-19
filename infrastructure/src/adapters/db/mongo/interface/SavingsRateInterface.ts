import { Types } from "mongoose";

export interface SavingsRateInterface {
  _id: Types.UUID;
  rate: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
