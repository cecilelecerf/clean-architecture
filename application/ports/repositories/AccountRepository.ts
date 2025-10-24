import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";

export interface AccountRepository {
  findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[] | null>;
  findByIBAN(iban: IBAN): Promise<AccountEntity | null>;
  findAllSavingsAccounts(): Promise<AccountEntity[] | null>;
  saveAccount(account: AccountEntity): Promise<void>;
  updateAccount(iban: IBAN, account: AccountEntity): Promise<void>;
  // TODO : pourquoi passer un account et un iban et pas juste un IBAN ?
  deleteAccount(iban: IBAN, account: AccountEntity): Promise<void>;
}
