export class AdministratorCannotLeaveThreadError extends Error {
  public readonly statusCode = 409;
  constructor(threadId: string, administratorId: string) {
    super(`Administrator ${administratorId} cannot leave thread ${threadId}.`);
    this.name = "AdministratorCannotLeaveThreadError";
  }
}
