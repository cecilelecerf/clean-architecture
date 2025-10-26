export class FactorNegativeError extends Error {
  public constructor() {
    super(`Factor cannot be negative`);
    this.name = "FactorNegativeError";
  }
}
