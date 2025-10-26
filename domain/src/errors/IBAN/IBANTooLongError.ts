export class IBANTooLongError extends Error {
  public constructor(
    public readonly length: number,
    public readonly iban: string
  ) {
    super(`IBAN is too long: ${length} characters`);
    this.name = "IBANTooLongError";
  }
}
