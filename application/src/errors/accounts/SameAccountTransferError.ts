export class SameAccountTransferError extends Error {
  public readonly statusCode = 404;
  public readonly name = "SameAccountTransferError";

  constructor() {
    super(`It is not possible to transfer money to the same account.`);
  }
}
