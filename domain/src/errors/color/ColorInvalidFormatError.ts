export class ColorInvalidFormatError extends Error {
  public readonly statusCode = 400;
  public constructor(public readonly color: string) {
    super(`Color has an invalid format: ${color}`);
    this.name = "ColorInvalidFormatError";
  }
}
