export class InvalidSymbolError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly symbol: string) {
    super(
      `Invalid symbol: "${symbol}". Symbol must be between 1 and 10 characters.`
    );
    this.name = "InvalidSymbolError";
  }
}
