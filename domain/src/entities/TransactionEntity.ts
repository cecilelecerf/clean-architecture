import { Money } from "@domain/values/Money";
import { AccountEntity } from "./AccountEntity";
import { IBAN } from "@domain/values/IBAN";

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
  >): TransactionEntity | Error {
    // Création d'une vraie error
    if (fromAccountId === toAccountId) {
      return new Error("Transaction cannot be made to the same account");
    }

    // Error impossible car déjà vérifier avec le type Date
    if (amount.amount <= 0) {
      return new Error("Transaction amount must be positive");
    }

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
      amount: this.amount.amount,
      currency: this.amount.currency,
      fromAccountIban: this.fromAccountId.value,
      toAccountIban: this.toAccountId.value,
      type: contextIban ? this.getTypeForAccount(contextIban) : undefined,
    };
  }
}

export type TransactionDTO = {
  amount: number;
  currency: string;
  fromAccountIban: string;
  toAccountIban: string;
  date: string;
  type?: "debit" | "credit";
} & Pick<TransactionEntity, "id" | "icon" | "label">;
