export class ThreadNotActiveError extends Error {
  public readonly statusCode = 400;
  constructor(message = "Thread inactif.") {
    super(message);
    this.name = "ThreadNotActiveError";
  }
}
