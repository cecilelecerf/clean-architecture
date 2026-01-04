export class InvalidFormuleTypeError extends Error {
  public readonly code = "INVALID_FORMULE_TYPE" as const;
  public readonly statusCode = 400;

  constructor(
    public readonly invalidValue: string,
    public readonly validTypes: readonly string[]
  ) {
    super(
      `Type de formule invalide: "${invalidValue}". Types valides: ${validTypes.join(
        ", "
      )}`
    );
    this.name = "InvalidFormuleTypeError";
    Object.setPrototypeOf(this, InvalidFormuleTypeError.prototype);
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      invalidValue: this.invalidValue,
      validTypes: this.validTypes,
    };
  }
}
