export class OrderNotFoundError extends Error {
  public readonly name = "OrderNotFoundError";
  public readonly statusCode = 404;

  constructor() {
    super(`Order not found`);
  }
}
