import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface CreditRepository {
  findById(id: CreditEntity["id"]): Promise<CreditEntity | null>;
  // TODO : adapter le repo avec la nouvelle entity
  findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]>;
  findActiveCredits(): Promise<CreditEntity[]>;
  save(credit: CreditEntity): Promise<void>;
  update(credit: CreditEntity): Promise<void>;
  delete(id: CreditEntity["id"]): Promise<void>;
}
