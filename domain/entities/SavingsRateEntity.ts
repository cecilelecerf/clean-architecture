export class SavingsRateEntity {
  private constructor(
    public id: string,
    public rate: number,
    public effectiveDate: Date
  ) {}

  public static from({ id, rate, effectiveDate}: { id: string, rate: number, effectiveDate: Date }) {
    return new SavingsRateEntity(
      id,
      rate,
      effectiveDate
    );
  }
}