import {
  IBANInvalidCheckDigitsError,
  IBANInvalidFormatError,
  IBANTooLongError,
  IBANTooShortError,
} from "@domain/errors/IBAN";

export class IBAN {
  private constructor(public readonly value: string) {}
  public static from(iban: string) {
    return new IBAN(iban);
  }
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

  public static generate(countryCode: string): IBAN {
    const sanitizedCountry = countryCode.toUpperCase();
    const sanitizedBban = IBAN.generateRandomBBAN(sanitizedCountry);

    const rearranged = sanitizedBban + sanitizedCountry + "00";
    const numeric = rearranged
      .split("")
      .map((c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return (code - 55).toString();
        return c;
      })
      .join("");

    let remainder = "";
    for (let i = 0; i < numeric.length; i += 7) {
      const block = remainder + numeric.substring(i, i + 7);
      remainder = (parseInt(block, 10) % 97).toString();
    }

    const checkDigits = String(98 - parseInt(remainder, 10)).padStart(2, "0");
    return new IBAN(`${sanitizedCountry}${checkDigits}${sanitizedBban}`);
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
        if (code >= 65 && code <= 90) return (code - 55).toString();
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

  private static generateRandomBBAN(countryCode: string): string {
    if (countryCode === "FR") {
      const bankCode = IBAN.randomDigits(5);
      const branchCode = IBAN.randomDigits(5);
      const accountNumber = IBAN.randomAlphanumeric(11);
      const key = IBAN.randomDigits(2);
      return `${bankCode}${branchCode}${accountNumber}${key}`;
    }

    return IBAN.randomAlphanumeric(23);
  }
  private static randomDigits(length: number): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }
  private static randomAlphanumeric(length: number): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
