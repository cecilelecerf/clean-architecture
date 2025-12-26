export class InvalidOrderTypeError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly type: string) {
    super(`Invalid order type: "${type}". Type must be "buy" or "sell".`);
    this.name = "InvalidOrderTypeError";
  }
}
