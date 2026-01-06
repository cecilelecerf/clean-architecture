export class InvalidOrderStatusError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly status: string) {
    super(
      `Invalid order status: "${status}". Type must be "pending", "executed" or "cancelled".`
    );
    this.name = "InvalidOrderStatusError";
  }
}
