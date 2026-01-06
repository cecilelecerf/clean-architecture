export class InvalidOrderTypeError extends Error {
  public readonly statusCode = 404;

  constructor(type: string) {
    super(`Invalid order type: ${type}. Must be 'buy' or 'sell'`);
    this.name = "InvalidOrderTypeError";
  }
}
