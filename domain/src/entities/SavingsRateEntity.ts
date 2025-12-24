import { Percentage } from "@domain/values/Percentage";

export class SavingsRateEntity {
  private constructor(
    public id: string,
    public rate: Percentage,
    public effectiveDate: Date,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  public static from({
    id,
    rate,
    effectiveDate,
    createdAt,
    updatedAt,
  }: Pick<
    SavingsRateEntity,
    "id" | "rate" | "effectiveDate" | "createdAt" | "updatedAt"
  >) {
    return new SavingsRateEntity(id, rate, effectiveDate, createdAt, updatedAt);
  }

  toDTO(): SavingsRateDTO {
    return {
      id: this.id,
      rate: this.rate.value,
      effectiveDate: this.effectiveDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type SavingsRateDTO = { rate: number } & Pick<
  SavingsRateEntity,
  "id" | "effectiveDate" | "createdAt" | "updatedAt"
>;
