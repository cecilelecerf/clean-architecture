export class TransactionNotFoundError extends Error {
  public readonly statusCode = 404;

  constructor(transactionId: string) {
    super(`Transaction with id "${transactionId}" not found`);
    this.name = "TransactionNotFoundError";
  }
}
