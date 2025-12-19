import { Types } from "mongoose";

export interface ThreadInterface {
  _id: Types.UUID;
  participantsId: Types.UUID[];
  title: string;
  createdAt: Date;
  isClose: boolean;
  type: "external" | "internal";
  administratorId: Types.UUID;
  updatedAt: Date;
}
