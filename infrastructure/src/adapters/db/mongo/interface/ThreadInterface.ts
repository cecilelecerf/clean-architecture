import { Types } from "mongoose";

export interface ThreadInterface {
  participantsId: Types.ObjectId[];
  title: string;
  createdAt: Date;
  isClose: boolean;
  type: "external" | "internal";
  administratorId: Types.ObjectId;
  updatedAt: Date;
}
