import { AccountEntity } from "@domain/entities/AccountEntity";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { AccountEntityWithUser } from "./AccountRepository";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";

export type CreditEntityWithFormuleAndAccount = CreditEntity & {
  account: AccountEntityWithUser;
} & { formule: FormuleCreditEntity };
export type CreditEntityWithFormuleAndAdvisor = CreditEntity & {
  advisor: UserEntity | null;
} & { account: AccountEntity } & {
  formule: FormuleCreditEntity;
} & { transactions: TransactionEntity[] };
export type CreditEntityWithFormule = CreditEntity & {
  formule: FormuleCreditEntity;
};
export interface CreditRepository {
  findById(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAdvisor | null>;
  findByIdWithDetails(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAccount | null>;
  findAllByAccountIban(accountId: IBAN): Promise<CreditEntityWithFormule[]>;
  findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntityWithFormule[]>;
  findAllByStatus(
    status?: CreditEntity["status"]
  ): Promise<CreditEntityWithFormule[]>;
  save(credit: CreditEntity): Promise<void>;
  update(credit: CreditEntity): Promise<void>;
  delete(id: CreditEntity["id"]): Promise<void>;
  findAllByFormuleId(
    formuleId: FormuleCreditEntity["id"]
  ): Promise<CreditEntity[]>;
}
