import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";

export interface AccountRepository {
  findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]>;
  findByIBAN(iban: IBAN): Promise<AccountEntity>;
  saveAccount(account: AccountEntity): Promise<void>;
  updateAccount(account: AccountEntity): Promise<void>;
  deleteAccount(account: AccountEntity): Promise<void>;
}
