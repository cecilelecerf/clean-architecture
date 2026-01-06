import { InvalidISINError } from "@domain/errors/ISIN";

export class ISIN {
  private constructor(private readonly value: string) {}
  static from(isin: string): ISIN {
    return new ISIN(isin);
  }
  static create(isin: string): ISIN | InvalidISINError {
    const trimmed = isin.trim().toUpperCase();

    const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

    if (!isinRegex.test(trimmed)) {
      return new InvalidISINError(isin);
    }

    return new ISIN(trimmed);
  }

  static generate(countryCode = "FR"): ISIN {
    const base =
      countryCode.toUpperCase() +
      Array.from({ length: 9 }, () =>
        Math.random().toString(36).charAt(2).toUpperCase()
      ).join("");

    const checksum = this.calculateChecksum(base);
    return new ISIN(base + checksum);
  }
  public static isValid(isin: string): ISIN | InvalidISINError {
    if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) {
      return new InvalidISINError(isin);
    }

    const expectedChecksum = Number(isin[11]);
    const calculated = this.calculateChecksum(isin.slice(0, 11));

    return expectedChecksum === calculated
      ? ISIN.from(isin)
      : new InvalidISINError(isin);
  }

  private static calculateChecksum(base: string): number {
    const converted = base
      .split("")
      .map((char) =>
        isNaN(Number(char)) ? (char.charCodeAt(0) - 55).toString() : char
      )
      .join("");

    let sum = 0;
    let double = true;

    for (let i = converted.length - 1; i >= 0; i--) {
      let digit = Number(converted[i]);

      if (double) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      double = !double;
    }

    return (10 - (sum % 10)) % 10;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ISIN): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
