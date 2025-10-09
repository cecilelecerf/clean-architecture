import { CreditNotBelongsToClientError } from "@application/errors/credits/CreditNotBelongsToClientError";
import { CreditNotFoundError } from "@application/errors/credits/CreditNotFoundError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { Money } from "@domain/values/Money";

type Props = {
  clientId: UserEntity["id"];
  creditId: CreditEntity["id"];
};

type MonthlySchedule = {
  capitalPaid: Money;
  currentMonth: number;
  remainingBalanceBefore: Money;
  remainingBalanceAfter: Money;
};

export class CreditScheduleUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository
  ) {}
  public async execute({
    clientId,
    creditId,
  }: Props): Promise<MonthlySchedule[] | Error> {
    const client = await this.userRepository.findById(clientId);
    if (!client) throw new UserNotFoundError();
    if (!client.hasRole({ role: "client" }))
      throw new UserRoleMismatchError(["client"], client.role);

    const credit = await this.creditRepository.findById(creditId);

    if (!credit) throw new CreditNotFoundError();
    if (credit.userId !== client.id)
      throw new CreditNotBelongsToClientError(credit.id, client.id);

    const simulatedCredit = CreditEntity.from({
      ...credit,
    });
    const monthlySchedule: MonthlySchedule[] = [];
    Array.from({ length: simulatedCredit.durationMonths }).map((_, i) => {
      const before = simulatedCredit.getRemainingBalance();
      simulatedCredit.payMonthly();
      const after = simulatedCredit.getRemainingBalance();

      const capitalPaid = before.subtract(after);
      if (capitalPaid instanceof Error) throw capitalPaid;

      return monthlySchedule.push({
        capitalPaid,
        currentMonth: i,
        remainingBalanceBefore: before,
        remainingBalanceAfter: after,
      });
    });
    return monthlySchedule;
  }
}
