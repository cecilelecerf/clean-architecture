export class IBANTooShortError extends Error {
  public constructor(
    public readonly length: number,
    public readonly iban: string
  ) {
    super(`IBAN is too short: ${length} characters`);
    this.name = "IBANTooShortError";
  }
}
