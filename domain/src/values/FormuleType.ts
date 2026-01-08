import { InvalidFormuleTypeError } from "@domain/errors/formuleType";

export class FormuleType {
  private static readonly VALID_TYPES = [
    "CONSOMMATION",
    "PROFESSIONNEL",
    "AUTRE",
    "IMMOBILIER",
    "AUTO",
  ] as const;

  private constructor(
    private readonly _value: (typeof FormuleType.VALID_TYPES)[number]
  ) {}

  public static create(value: string): FormuleType | InvalidFormuleTypeError {
    const normalized = value.toUpperCase();

    if (!FormuleType.isValid(normalized)) {
      return new InvalidFormuleTypeError(normalized, this.VALID_TYPES);
    }

    return new FormuleType(
      normalized as (typeof FormuleType.VALID_TYPES)[number]
    );
  }

  public static from(value: string): FormuleType {
    return new FormuleType(value as (typeof FormuleType.VALID_TYPES)[number]);
  }

  public static isValid(
    value: string
  ): value is (typeof FormuleType.VALID_TYPES)[number] {
    return FormuleType.VALID_TYPES.includes(value as any);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: FormuleType): boolean {
    return this._value === other._value;
  }

  public isConsommation(): boolean {
    return this._value === "CONSOMMATION";
  }

  public isProfessionnel(): boolean {
    return this._value === "PROFESSIONNEL";
  }

  public isImmobilier(): boolean {
    return this._value === "IMMOBILIER";
  }

  public isAuto(): boolean {
    return this._value === "AUTO";
  }

  public getLabel(): string {
    const labels: Record<(typeof FormuleType.VALID_TYPES)[number], string> = {
      CONSOMMATION: "Crédit à la consommation",
      PROFESSIONNEL: "Crédit professionnel",
      IMMOBILIER: "Crédit immobilier",
      AUTO: "Crédit automobile",
      AUTRE: "Autres",
    };

    return labels[this._value];
  }
  public static getValidTypesWithLabels(): Array<{
    value: string;
    label: string;
  }> {
    return this.VALID_TYPES.map((type) => ({
      value: type,
      label: FormuleType.from(type).getLabel(),
    }));
  }
  public toString(): string {
    return this._value;
  }
}

export type FormuleTypeValue = (typeof FormuleType)["VALID_TYPES"][number];
