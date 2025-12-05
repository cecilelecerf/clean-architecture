export class FactorNegativeError extends Error {
  public readonly statusCode = 400;
  public constructor() {
    super(`Factor cannot be negative`);
    this.name = "FactorNegativeError";
  }
}
