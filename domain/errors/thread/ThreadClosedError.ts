export class ThreadClosedError extends Error {
  constructor(threadId: string) {
    super(`Thread ${threadId} is closed and cannot be modified.`);
    this.name = "ThreadClosedError";
  }
}
