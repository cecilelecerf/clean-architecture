export class InvalidCurrencyCodeError extends Error {
  public readonly name = "InvalidCurrencyCodeError";
  public readonly statusCode = 400;

  constructor(public readonly code: string) {
    super(
      `Code devise invalide : "${code}". Le code doit contenir exactement 3 lettres majuscules (ex: USD, EUR, GBP)`
    );
    Object.setPrototypeOf(this, InvalidCurrencyCodeError.prototype);
  }
}
