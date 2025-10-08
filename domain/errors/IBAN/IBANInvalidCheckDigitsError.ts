export class IBANInvalidCheckDigitsError extends Error {
  public constructor(public readonly iban: string) {
    super(`IBAN has invalid check digits: ${iban}`);
    this.name = "IBANInvalidCheckDigitsError";
  }
}
