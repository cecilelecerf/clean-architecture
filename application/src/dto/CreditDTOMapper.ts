import {
  CreditEntityWithFormule,
  CreditEntityWithFormuleAndAccount,
  CreditEntityWithFormuleAndAdvisor,
} from "@application/ports/repositories/CreditRepository";
import { CreditDTO } from "@domain/entities/CreditEntity";
import { FormuleCreditDTO } from "@domain/entities/FormuleCreditEntity";
import { AccountDTOMapper, AccountDTOWithUser } from "./AccountDTOMapper";
import { TransactionDTO } from "@domain/entities/TransactionEntity";
import { AccountDTO } from "@domain/entities/AccountEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type CreditDTOWithFormuleAndAccount = CreditDTO & {
  account: AccountDTOWithUser;
} & { formule: FormuleCreditDTO };

export type CreditDTOWithFormuleAndAdvisor = CreditDTO & {
  advisor: UserToDTO | null;
} & { formule: FormuleCreditDTO } & { account: AccountDTO } & {
  transactions: TransactionDTO[];
};

export type CreditDTOWithFormule = CreditDTO & { formule: FormuleCreditDTO };

export class CreditDTOMapper {
  static map(
    credit: CreditEntityWithFormuleAndAccount
  ): CreditDTOWithFormuleAndAccount {
    return Object.assign(
      credit.toDTO(),
      {
        account: AccountDTOMapper.map(credit.account),
      },
      {
        formule: credit.formule.toDTO(),
      }
    );
  }
  static mapWthFormule(credit: CreditEntityWithFormule): CreditDTOWithFormule {
    return Object.assign(credit.toDTO(), {
      formule: credit.formule.toDTO(),
    });
  }
  static mapWithAdvisor(
    credit: CreditEntityWithFormuleAndAdvisor
  ): CreditDTOWithFormuleAndAdvisor {
    return Object.assign(
      credit.toDTO(),
      {
        advisor: credit.advisor ? credit.advisor.toDTO() : null,
      },
      {
        formule: credit.formule.toDTO(),
      },
      {
        account: credit.account.toDTO(),
      },
      {
        transactions: credit.transactions
          ? credit.transactions.map((t) => t.toDTO())
          : [],
      }
    );
  }
  static maps(
    credits: CreditEntityWithFormuleAndAccount[]
  ): CreditDTOWithFormuleAndAccount[] {
    return credits.map((credit) => this.map(credit));
  }
}
