import { Types } from "mongoose";

export interface TagInterface {
  _id: Types.UUID;
  label: string;
  color:
    | "yellow"
    | "blue"
    | "purple"
    | "gray"
    | "orange"
    | "pink"
    | "red"
    | "green";
  createdAt: Date;
  updatedAt: Date;
}
