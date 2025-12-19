import { Document, Types } from "mongoose";

export interface TagInterface {
  _id: Types.UUID;
  label: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
