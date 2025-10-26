export class MoneyCurrencyMismatchError extends Error {
  public constructor() {
    super("Les devises doivent être identiques");
    this.name = "MoneyCurrencyMismatchError";
  }
}
