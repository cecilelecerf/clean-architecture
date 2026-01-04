export class InvalidVolumeError extends Error {
  public readonly name = "InvalidVolumeError";
  public readonly statusCode = 400;

  constructor(public readonly volume: number) {
    super(`Le volume doit être un entier positif : ${volume}`);
    Object.setPrototypeOf(this, InvalidVolumeError.prototype);
  }
}
