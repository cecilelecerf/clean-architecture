export class IBANInvalidCheckDigitsError extends Error {
  public readonly statusCode = 400;
  public constructor(public readonly iban: string) {
    super(`IBAN has invalid check digits: ${iban}`);
    this.name = "IBANInvalidCheckDigitsError";
  }
}
