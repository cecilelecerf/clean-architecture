export class IBANTooShortError extends Error {
  public readonly statusCode = 400;
  public constructor(
    public readonly length: number,
    public readonly iban: string
  ) {
    super(`IBAN is too short: ${length} characters`);
    this.name = "IBANTooShortError";
  }
}
