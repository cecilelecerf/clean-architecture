export class SameAccountError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly iban: string) {
    super(`Transaction cannot be made from and to the same account: ${iban}`);
    this.name = "SameAccountError";
  }
}
