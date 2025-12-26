export class InvalidTransactionAmountError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly amount: number) {
    super(`Invalid transaction amount: ${amount}. Amount must be positive.`);
    this.name = "InvalidTransactionAmountError";
  }
}
