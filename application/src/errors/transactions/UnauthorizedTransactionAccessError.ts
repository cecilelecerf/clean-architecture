export class UnauthorizedTransactionAccessError extends Error {
  public readonly statusCode = 403;

  constructor(userId: string, transactionId: string) {
    super(
      `User "${userId}" is not authorized to access transaction "${transactionId}"`
    );
    this.name = "UnauthorizedTransactionAccessError";
  }
}
