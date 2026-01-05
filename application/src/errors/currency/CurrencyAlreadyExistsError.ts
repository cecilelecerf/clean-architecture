export class CurrencyAlreadyExistsError extends Error {
  public readonly name = "CurrencylAlreadyExistsError";
  public readonly statusCode = 409;

  constructor(public readonly currency: string) {
    super(`The currency "${currency}" is already in use.`);
  }
}
