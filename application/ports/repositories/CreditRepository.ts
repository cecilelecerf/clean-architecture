import { CreditEntity } from "@domain/entities/CreditEntity";

export interface CreditRepository {
  findById(id: string): Promise<CreditEntity>;
  findByUserId(userId: string): Promise<CreditEntity[]>;
  findActiveCredits(): Promise<CreditEntity[]>;
  saveCredit(credit: CreditEntity): Promise<void>;
  updateCredit(credit: CreditEntity): Promise<void>;
  deleteCredit(credit: CreditEntity): Promise<void>;
}