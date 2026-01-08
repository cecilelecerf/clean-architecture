export class InvalidISINError extends Error {
  public readonly statusCode = 400;
  public constructor(public readonly isin: string) {
    super(`ISIN has an invalid format: ${isin}`);
    this.name = "InvalidISINError";
  }
}
