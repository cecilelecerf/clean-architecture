import { AccountEntity } from "@domain/entities/AccountEntity";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { AccountEntityWithUser } from "./AccountRepository";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";

export type CreditEntityWithFormuleAndAccount = CreditEntity & { account: AccountEntityWithUser | null } & { formule: FormuleCreditEntity | null };
export type CreditEntityWithFormuleAndAdvisor = CreditEntity & { advisor: UserEntity | null } & { account: AccountEntity | null } & { formule: FormuleCreditEntity | null } & { transactions: TransactionEntity[] | null };
export type CreditEntityWithFormule = CreditEntity & { formule: FormuleCreditEntity | null };
export interface CreditRepository {
  findById(id: CreditEntity["id"]): Promise<CreditEntityWithFormuleAndAdvisor | null>;
  findByIdWithDetails(id: CreditEntity["id"]): Promise<CreditEntityWithFormuleAndAccount | null>
  findAllByAccountIban(accountId: IBAN): Promise<CreditEntityWithFormule[]>;
  findActiveCredits(today: Date): Promise<CreditEntityWithFormule[]>;
  findPendingCredits(): Promise<CreditEntityWithFormule[]>;
  save(credit: CreditEntity): Promise<void>;
  update(credit: CreditEntity): Promise<void>;
  delete(id: CreditEntity["id"]): Promise<void>;
}
