export class ThreadNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "ThreadNotFoundError";

  constructor() {
    super(`Thread not found`);
  }
}
