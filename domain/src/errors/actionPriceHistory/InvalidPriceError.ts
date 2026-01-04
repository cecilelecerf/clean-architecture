export class InvalidPriceError extends Error {
  public readonly name = "InvalidPriceError";
  public readonly statusCode = 400;

  constructor(public readonly price: number) {
    super(`Le prix doit être positif : ${price}`);
    Object.setPrototypeOf(this, InvalidPriceError.prototype);
  }
}
