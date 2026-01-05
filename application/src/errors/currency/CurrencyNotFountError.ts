export class CurrencyNotFoundError extends Error {
  public readonly name = "CurrencyNotFoundError";
  public readonly statusCode = 404;

  constructor(currency: string) {
    super(`Currency: ${currency} not found`);
  }
}
