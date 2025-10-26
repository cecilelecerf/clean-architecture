export class ThreadNotFoundError extends Error {
  public readonly name = "ThreadNotFoundError";

  constructor() {
    super(`Thread not found`);
  }
}
