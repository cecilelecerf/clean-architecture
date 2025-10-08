export class MoneyCurrencyMissingError extends Error {
  public constructor(public readonly currency: string) {
    super("La devise est obligatoire");
    this.name = "MoneyCurrencyMissingError";
  }
}