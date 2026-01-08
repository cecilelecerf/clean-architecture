export class InvalidQuantityError extends Error {
  public readonly name = "InvalidQuantityError";
  public readonly statusCode = 400;

  constructor(public readonly quantity: number) {
    super(`La quantité doit être un entier positif : ${quantity}`);
    Object.setPrototypeOf(this, InvalidQuantityError.prototype);
  }
}
