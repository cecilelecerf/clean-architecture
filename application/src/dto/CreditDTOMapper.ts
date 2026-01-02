import { CreditEntityWithFormule, CreditEntityWithFormuleAndAccount, CreditEntityWithFormuleAndAdvisor } from "@application/ports/repositories/CreditRepository";
import { CreditDTO } from "@domain/entities/CreditEntity";
import { FormuleCreditDTO } from "@domain/entities/FormuleCreditEntity";
import { AccountDTOMapper, AccountDTOWithUser } from "./AccountDTOMapper";
import { UserToFront } from "@domain/entities/UserEntity";
import { TransactionDTO } from "@domain/entities/TransactionEntity";
import { AccountDTO } from "@domain/entities/AccountEntity";

export type CreditDTOWithFormuleAndAccount = CreditDTO & { account: AccountDTOWithUser | null } & { formule: FormuleCreditDTO | null };

export type CreditDTOWithFormuleAndAdvisor = CreditDTO & { advisor: UserToFront | null } & { formule: FormuleCreditDTO | null } & { account: AccountDTO | null } & { transactions: TransactionDTO[] | null };

export type CreditDTOWithFormule = CreditDTO & { formule: FormuleCreditDTO | null };

export class CreditDTOMapper {
  static map(credit: CreditEntityWithFormuleAndAccount): CreditDTOWithFormuleAndAccount {
    return Object.assign(credit.toDTO(), {
      account: credit.account ? AccountDTOMapper.map(credit.account) : null,
    }, {
      formule: credit.formule ? credit.formule.toDTO() : null,
    });
  }
  static mapWthFormule(credit: CreditEntityWithFormule): CreditDTOWithFormule{
    return Object.assign(credit.toDTO(), {
      formule: credit.formule ? credit.formule.toDTO() : null,
    });
  }
  static mapWithAdvisor(credit: CreditEntityWithFormuleAndAdvisor): CreditDTOWithFormuleAndAdvisor {
    return Object.assign(credit.toDTO(), {
      advisor: credit.advisor ? credit.advisor.toFront() : null,
    }, {
      formule: credit.formule ? credit.formule.toDTO() : null,
    },{
      account: credit.account ? credit.account.toDTO() : null,
    }, {
      transactions: credit.transactions
        ? credit.transactions.map(t => t.toDTO())
        : [],
    });
  }
  static maps(credits: CreditEntityWithFormuleAndAccount[]): CreditDTOWithFormuleAndAccount[] {
    return credits.map((credit) => this.map(credit));
  }
}