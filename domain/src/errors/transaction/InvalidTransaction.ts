export class InvalidTransaction extends Error {
  public readonly statusCode = 400;

  constructor() {
    super(`Invalid transaction amount:. Amount must be positive.`);
    this.name = "InvalidTransactionAmountError";
  }
}
