import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";

export interface AccountRepository {
  findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]>;
  findByIBAN(iban: IBAN): Promise<AccountEntity | null>;
  save(account: AccountEntity): Promise<void>;
  update(account: AccountEntity): Promise<void>;
  delete(iban: IBAN): Promise<void>;
}
