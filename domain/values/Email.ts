import { EmailInvalidFormatError } from "@domain/errors/email/EmailInvalidFormatError";

export class Email {
  public readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  public static create(email: string): Email | EmailInvalidFormatError {
    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      return new EmailInvalidFormatError(email);
    }

    return new Email(sanitized);
  }

  public is(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
