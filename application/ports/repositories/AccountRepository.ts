import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";

export interface AccountRepository {
  findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]>;
  findByIBAN(iban: IBAN): Promise<AccountEntity | null>;
  findAllSavingsAccounts(): Promise<AccountEntity[]>;
  // TODO : pourquoi passer un account et un iban et pas juste un IBAN ?
  save(account: AccountEntity): Promise<void>;
  update(iban: IBAN, account: AccountEntity): Promise<void>;
  delete(iban: IBAN, account: AccountEntity): Promise<void>;
}
