import { Types } from "mongoose";

export interface ThreadInterface {
  _id: Types.UUID;
  participantsId: Types.UUID[];
  title: string;
  isClose: boolean;
  type: "internal" | "external";
  administratorId?: Types.UUID;
  createdAt: Date;
  updatedAt: Date;
}
