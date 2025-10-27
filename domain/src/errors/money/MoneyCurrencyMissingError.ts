export class MoneyCurrencyMissingError extends Error {
  public readonly statusCode = 400;
  public constructor(public readonly currency: string) {
    super("La devise est obligatoire");
    this.name = "MoneyCurrencyMissingError";
  }
}
