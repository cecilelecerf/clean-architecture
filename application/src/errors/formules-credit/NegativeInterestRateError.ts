export class NegativeInterestRateError extends Error {
  public readonly name = "NegativeInterestRateError";
  public readonly statusCode = 401;

  constructor() {
    super("Interest Rate should be positive");
  }
}
