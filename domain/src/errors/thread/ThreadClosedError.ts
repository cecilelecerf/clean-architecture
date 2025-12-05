export class ThreadClosedError extends Error {
  public readonly statusCode = 409;
  constructor(threadId: string) {
    super(`Thread ${threadId} is closed and cannot be modified.`);
    this.name = "ThreadClosedError";
  }
}
