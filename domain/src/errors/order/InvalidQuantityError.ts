export class InvalidQuantityError extends Error {
  public readonly statusCode = 400;

  constructor(public readonly quantity: number) {
    super(
      `Invalid quantity: ${quantity}. Quantity must be a positive integer.`
    );
    this.name = "InvalidQuantityError";
  }
}
