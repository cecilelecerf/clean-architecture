export class ThreadTransferToSameAdministratorError extends Error {
  public readonly statusCode = 409;
  constructor(
    public readonly threadId: string,
    public readonly administratorId: string
  ) {
    super(
      `Cannot transfer thread (${threadId}) to the same administrator (${administratorId}).`
    );
    this.name = "ThreadTransferToSameAdministratorError";
  }
}
