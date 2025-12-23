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
}

export type SavingsRateDTO = {
  id: string;
  rate: number;
  effectiveDate: Date;
  createdAt: Date; 
  updatedAt: Date;
};
