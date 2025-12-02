export class RateNotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly name = "RateNotFoundError";

  constructor() {
    super(`Rate not found`);
  }
}
