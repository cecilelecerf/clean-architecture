import { IBANInvalidCheckDigitsError } from "@domain/errors/IBAN/IBANInvalidCheckDigitsError";
import { IBANInvalidFormatError } from "@domain/errors/IBAN/IBANInvalidFormatError";
import { IBANTooLongError } from "@domain/errors/IBAN/IBANTooLongError";
import { IBANTooShortError } from "@domain/errors/IBAN/IBANTooShortError";

export class IBAN {
  private constructor(public readonly value: string) {}

  public static create(
    iban: string
  ):
    | IBAN
    | IBANTooShortError
    | IBANTooLongError
    | IBANInvalidFormatError
    | IBANInvalidCheckDigitsError {
    const sanitized = iban.replace(/\s+/g, "").toUpperCase();
    const length = sanitized.length;

    if (length < 15) return new IBANTooShortError(length, iban);
    if (length > 34) return new IBANTooLongError(length, iban);
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;
    if (!ibanRegex.test(sanitized)) {
      return new IBANInvalidFormatError(sanitized);
    }
    if (!IBAN.checkDigitsAreValid(sanitized)) {
      return new IBANInvalidCheckDigitsError(sanitized);
    }
    return new IBAN(sanitized);
  }

  public is(other: IBAN): boolean {
    return this.value === other.value;
  }
  private static checkDigitsAreValid(iban: string): boolean {
    const rearranged = iban.slice(4) + iban.slice(0, 4);

    const numericIban = rearranged
      .split("")
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return (code - 55).toString(); // A=10, B=11 ...
        return c;
      })
      .join("");

    let remainder = "";
    for (let i = 0; i < numericIban.length; i += 7) {
      const block = remainder + numericIban.substr(i, 7);
      remainder = (parseInt(block, 10) % 97).toString();
    }

    return parseInt(remainder, 10) === 1;
  }
}
