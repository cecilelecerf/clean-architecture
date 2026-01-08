import { Money, MoneyToDTO } from "@domain/values/Money";
import { AccountEntity } from "./AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import {
  InvalidTransaction,
  InvalidTransactionAmountError,
  InvalidTransactionLabelError,
} from "@domain/errors/transaction";

export class TransactionEntity {
  private constructor(
    public id: string,
    public label: string,
    public icon: string,
    public fromAccountId: AccountEntity["iban"],
    public toAccountId: AccountEntity["iban"],
    public amount: Money,
    public date: Date
  ) {}

  private static validateLabel(
    label: string
  ): string | InvalidTransactionLabelError {
    const trimmed = label.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
      return new InvalidTransactionLabelError(label, trimmed.length);
    }

    return trimmed;
  }

  private static validateAmount(
    amount: Money
  ): Money | InvalidTransactionAmountError {
    if (amount.amount <= 0) {
      return new InvalidTransactionAmountError(amount.amount);
    }

    return amount;
  }

  private static validateAccounts(
    fromAccountId: IBAN,
    toAccountId: IBAN
  ): void | InvalidTransaction {
    if (fromAccountId.is(toAccountId)) {
      return new InvalidTransaction();
    }
  }

  public static create({
    id,
    fromAccountId,
    label,
    icon,
    toAccountId,
    amount,
    date,
  }: Pick<
    TransactionEntity,
    | "fromAccountId"
    | "toAccountId"
    | "amount"
    | "id"
    | "label"
    | "icon"
    | "date"
  >):
    | TransactionEntity
    | InvalidTransaction
    | InvalidTransactionLabelError
    | InvalidTransactionAmountError {
    const accountsValidation = this.validateAccounts(
      fromAccountId,
      toAccountId
    );
    if (accountsValidation instanceof Error) return accountsValidation;

    const validatedLabel = this.validateLabel(label);
    if (validatedLabel instanceof Error) return validatedLabel;

    const validatedAmount = this.validateAmount(amount);
    if (validatedAmount instanceof Error) return validatedAmount;

    return new TransactionEntity(
      id,
      validatedLabel,
      icon,
      fromAccountId,
      toAccountId,
      validatedAmount,
      date
    );
  }

  public static from({
    id,
    label,
    icon,
    fromAccountId,
    toAccountId,
    amount,
    date,
  }: Pick<
    TransactionEntity,
    | "id"
    | "fromAccountId"
    | "toAccountId"
    | "label"
    | "icon"
    | "amount"
    | "date"
  >) {
    return new TransactionEntity(
      id,
      label,
      icon,
      fromAccountId,
      toAccountId,
      amount,
      date
    );
  }
  public getTypeForAccount(accountIban: IBAN): "debit" | "credit" {
    return this.fromAccountId.is(accountIban) ? "debit" : "credit";
  }
  toDTO(contextIban?: IBAN): TransactionDTO {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon,
      date: this.date.toISOString(),
      amount: this.amount.toJSON(),
      fromAccountIban: this.fromAccountId.value,
      toAccountIban: this.toAccountId.value,
      type: contextIban ? this.getTypeForAccount(contextIban) : undefined,
    };
  }
}

export type TransactionDTO = {
  amount: MoneyToDTO;
  fromAccountIban: string;
  toAccountIban: string;
  date: string;
  type?: "debit" | "credit";
} & Pick<TransactionEntity, "id" | "icon" | "label">;
