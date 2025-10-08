import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";

export interface AccountRepository {
  findByUserId(userId: string): Promise<AccountEntity[]>;
  findByIBAN(iban: IBAN): Promise<AccountEntity>;
  saveAccount(account: AccountEntity): Promise<void>;
  updateAccount(account: AccountEntity): Promise<void>;
  deleteAccount(account: AccountEntity): Promise<void>;
}