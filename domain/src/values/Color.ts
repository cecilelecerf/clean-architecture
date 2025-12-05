import { ColorInvalidFormatError } from "../errors/color/ColorInvalidFormatError";

export class Color {
  private constructor(
    private readonly value:
      | "blue"
      | "red"
      | "pink"
      | "yellow"
      | "purple"
      | "gray"
      | "orange"
      | "green"
  ) {}

  static validColors = [
    "yellow",
    "blue",
    "purple",
    "gray",
    "orange",
    "pink",
    "red",
    "green",
  ] as const;

  static from(value: string): Color | ColorInvalidFormatError {
    if (!this.validColors.includes(value as any)) {
      return new ColorInvalidFormatError(value);
    }
    return new Color(value as any);
  }

  getValue():
    | "blue"
    | "red"
    | "pink"
    | "yellow"
    | "purple"
    | "gray"
    | "orange"
    | "green" {
    return this.value;
  }

  toCssClass(): string {
    return `text-${this.value}`;
  }

  toString(): string {
    return this.value;
  }
}
