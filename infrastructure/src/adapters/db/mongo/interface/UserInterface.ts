export interface UserInterface {
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
