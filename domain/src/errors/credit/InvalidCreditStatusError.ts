import { CreditStatus } from "@domain/entities/CreditEntity";

export class InvalidCreditStatusError extends Error {
  public readonly statusCode = 409;

  constructor(public readonly status: string) {
    super(
      `Invalid credit status: ${status}. Must be one of: ${Object.values(
        CreditStatus
      ).join(", ")}`
    );
    this.name = "InvalidCreditStatusError";
  }
}
