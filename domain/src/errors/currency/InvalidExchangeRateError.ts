export class InvalidExchangeRateError extends Error {
  public readonly name = "InvalidExchangeRateError";
  public readonly statusCode = 400;

  constructor(public readonly rate: number) {
    super(
      `Taux de change invalide : ${rate}. Le taux doit être un nombre positif et fini`
    );
    Object.setPrototypeOf(this, InvalidExchangeRateError.prototype);
  }
}
