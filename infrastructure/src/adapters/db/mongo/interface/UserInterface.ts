import { Types } from "mongoose";

export interface UserInterface {
  _id: Types.UUID;
  firstname: string;
  lastname: string;
  email: string;
  passwordHash?: string;
  role: "client" | "conseiller" | "directeur";
  isActive: boolean;
  confirmedAt?: Date;
  phoneNumber?: string;
  city?: string;
  address?: string;
  country?: string;
  postalCode?: string;
  sexe?: "girl" | "boy" | "other";
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
