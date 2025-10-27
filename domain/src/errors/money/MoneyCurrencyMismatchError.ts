export class MoneyCurrencyMismatchError extends Error {
  public readonly statusCode = 409;
  public constructor() {
    super("Les devises doivent être identiques");
    this.name = "MoneyCurrencyMismatchError";
  }
}
