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

  // Calcul de la mensualité (mensualité constante)
  public calculateMonthlyPayment(): Money {
    const P = this.principal.amount;
    const n = this.months;
    const r = this.interestRate / 12 / 100; // taux mensuel
    const basePayment = (P * r) / (1 - Math.pow(1 + r, -n));
    const insurance = ((this.insuranceRate / 100) * P) / n;
    return new Money(basePayment + insurance);
  }

  // Payer une mensualité
  public payMonthly(): void {
    if (this.isFullyPaid()) {
      throw new Error("Credit already fully paid");
    }
    const payment = this.calculateMonthlyPayment();
    this.remainingBalance = this.remainingBalance.subtract(payment);
  }
  public isFullyPaid(): boolean {
    return this.remainingBalance.amount <= 0;
  }

  // Retourne le capital restant
  public getRemainingBalance(): Money {
    return this.remainingBalance;
  }
}
