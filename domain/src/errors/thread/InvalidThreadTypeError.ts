export class InvalidThreadTypeError extends Error {
  public readonly statusCode = 400;

  constructor(
    public readonly threadId: string,
    public readonly currentType: "external" | "internal",
    public readonly expectedType: ("external" | "internal")[]
  ) {
    super(
      `Invalid thread type. Thread ${threadId} is of type "${currentType}" but expected "${expectedType.map(
        (type) => type
      )}"`
    );
    this.name = "InvalidThreadTypeError";
  }
}
