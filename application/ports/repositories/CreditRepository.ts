import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface CreditRepository {
  findById(id: CreditEntity["id"]): Promise<CreditEntity | null>;
  findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]>;
  findActiveCredits(): Promise<CreditEntity[]>;
  save(credit: CreditEntity): Promise<void>;
  update(credit: CreditEntity): Promise<void>;
  delete(credit: CreditEntity): Promise<void>;
}
