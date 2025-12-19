import { Types } from "mongoose";

export interface UserInterface {
  _id: Types.UUID;
  firstname: string;
  lastname: string;
  email: string;
  passwordHash: string;
  role: "client" | "conseiller" | "directeur";
  isActive: boolean;
  createdAt: Date;
  confirmedAt: Date;
  updatedAt: Date;
}
