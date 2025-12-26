export class InvalidISINError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly isin: string) {
    super(
      `Invalid ISIN: "${isin}". ISIN must be 12 characters (2 letters + 10 digits).`
    );
    this.name = "InvalidISINError";
  }
}
