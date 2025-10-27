export class Error extends Error {
  public readonly name: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 404) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}
