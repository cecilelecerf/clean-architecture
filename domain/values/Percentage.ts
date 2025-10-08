import { InvalidPercentageError } from "@domain/errors/percentage/InvalidPercentageError";

export class Percentage {
  private constructor(public readonly value: number) {}

  /**
   * Factory de création — valide le pourcentage
   */
  public static create(value: number): Percentage | InvalidPercentageError {
    if (isNaN(value) || value < 0 || value > 100) {
      return new InvalidPercentageError(value);
    }

    return new Percentage(Number(value.toFixed(4))); // 4 décimales max
  }

  /**
   * Retourne la valeur décimale (ex: 2.5% → 0.025)
   */
  public toDecimal(): number {
    return this.value / 100;
  }

  /**
   * Retourne un nouveau pourcentage en ajoutant un delta
   */
  public add(other: Percentage): Percentage | InvalidPercentageError {
    const result = this.value + other.value;
    return Percentage.create(result);
  }

  /**
   * Retourne un nouveau pourcentage en soustrayant un delta
   */
  public subtract(other: Percentage): Percentage | InvalidPercentageError {
    const result = this.value - other.value;
    return Percentage.create(result);
  }

  /**
   * Représentation textuelle
   */
  public toString(): string {
    return `${this.value}%`;
  }

  public equals(other: Percentage): boolean {
    return this.value === other.value;
  }
}
