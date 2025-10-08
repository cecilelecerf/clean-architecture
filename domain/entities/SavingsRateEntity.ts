import { Percentage } from "@domain/values/Percentage";

export class SavingsRateEntity {
  private constructor(
    public id: string,
    public rate: Percentage,
    public effectiveDate: Date
  ) {}

  public static from({ id, rate, effectiveDate }: SavingsRateEntity) {
    return new SavingsRateEntity(id, rate, effectiveDate);
  }
}
