import { IBAN } from "@domain/values/IBAN";

export class SameAccountTransactionError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly iban: IBAN) {
    super(
      `Transaction cannot be made from and to the same account: ${iban.value}`
    );
    this.name = "SameAccountTransactionError";
  }
}
