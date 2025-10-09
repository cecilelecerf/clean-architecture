import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface CreditRepository {
  findById(id: CreditEntity["id"]): Promise<CreditEntity | null>;
  findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]>;
  findActiveCredits(): Promise<CreditEntity[]>;
  saveCredit(credit: CreditEntity): Promise<void>;
  updateCredit(credit: CreditEntity): Promise<void>;
  deleteCredit(credit: CreditEntity): Promise<void>;
}
