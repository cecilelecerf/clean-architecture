export class AdministratorCannotLeaveThreadError extends Error {
  constructor(threadId: string, administratorId: string) {
    super(`Administrator ${administratorId} cannot leave thread ${threadId}.`);
    this.name = "AdministratorCannotLeaveThreadError";
  }
}
