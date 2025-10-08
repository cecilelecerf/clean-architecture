import { UserEntity } from "./UserEntity";

export class CreditEntity {
  private constructor(
    public id: string,
    public userId: UserEntity["id"],
    public principal: number,
    // ? annuel
    public interestRate: number,
    // ? sur le tota;
    public insuranceRate: number,
    public months: number,
    public startDate: Date,
    public monthlyPayment: number,
    public remainingBalance: number
  ) {}
  public static from({
    id,
    userId,
    principal,
    insuranceRate,
    interestRate,
    startDate,
    monthlyPayment,
    months,
    remainingBalance,
  }: CreditEntity) {
    return new CreditEntity(
      id,
      userId,
      principal,
      interestRate,
      insuranceRate,
      months,
      startDate,
      monthlyPayment,
      remainingBalance
    );
  }
}
