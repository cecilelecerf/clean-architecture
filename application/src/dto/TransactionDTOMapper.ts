import {
  TransactionEntityWithAccount,
  TransactionEntityWithAccountWithUser,
} from "@application/ports/repositories/TransactionRepository";
import { AccountDTO } from "@domain/entities/AccountEntity";
import { TransactionDTO } from "@domain/entities/TransactionEntity";
import { AccountDTOWithUser } from "./AccountDTOMapper";

export type TransactionEntityWithAccountDTO = TransactionDTO & {
  fromAccount: AccountDTO;
  toAccount: AccountDTO;
};
export type TransactionEntityWithAccountWithUserDTO = TransactionDTO & {
  fromAccount: AccountDTOWithUser;
  toAccount: AccountDTOWithUser;
};
export class TransactionDTOMapper {
  static map(
    transaction: TransactionEntityWithAccount
  ): TransactionEntityWithAccountDTO {
    return Object.assign(transaction.toDTO(), {
      fromAccount: transaction.fromAccount.toDTO(),
      toAccount: transaction.toAccount.toDTO(),
    });
  }
  static maps(
    transactions: TransactionEntityWithAccount[]
  ): TransactionEntityWithAccountDTO[] {
    return transactions.map((transaction) => this.map(transaction));
  }
  static withUserMap(
    transaction: TransactionEntityWithAccountWithUser
  ): TransactionEntityWithAccountWithUserDTO {
    return Object.assign(transaction.toDTO(), {
      fromAccount: Object.assign(transaction.fromAccount.toDTO(), {
        user: transaction.fromAccount.user
          ? transaction.fromAccount.user.toFront()
          : null,
      }),
      toAccount: Object.assign(transaction.toAccount.toDTO(), {
        user: transaction.toAccount.user
          ? transaction.toAccount.user.toFront()
          : null,
      }),
    });
  }
  static withUserMaps(
    transactions: TransactionEntityWithAccountWithUser[]
  ): TransactionEntityWithAccountWithUserDTO[] {
    return transactions.map((transaction) => this.withUserMap(transaction));
  }
}
