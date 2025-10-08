export class IBANInvalidFormatError extends Error {
  public constructor(public readonly iban: string) {
    super(`IBAN has an invalid format: ${iban}`);
    this.name = "IBANInvalidFormatError";
  }
}
