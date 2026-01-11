import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";

export type AccountEntityWithUser = AccountEntity & { user: UserEntity };

export interface AccountRepository {
  findByUserId(userId: UserEntity["id"] | null): Promise<AccountEntity[]>;
  findByIBAN(iban: IBAN): Promise<AccountEntity | null>;
  findAllSavingsAccounts(): Promise<AccountEntity[]>;
  findBankInterestAccount(): Promise<AccountEntity | null>;
  findBankReadyAccount(): Promise<AccountEntity | null>;
  findByType(type: AccountEntity["type"]): Promise<AccountEntity[]>;
  findByTypeSection(type: "client" | "bank"): Promise<AccountEntity[]>;
  findByTypeSectionWithUser(
    type: "client" | "bank"
  ): Promise<AccountEntityWithUser[]>;
  save(account: AccountEntity): Promise<void>;
  update(account: AccountEntity): Promise<void>;
  delete(iban: IBAN): Promise<void>;
}
