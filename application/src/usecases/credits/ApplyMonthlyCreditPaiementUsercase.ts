import { CreditNotFoundError } from "@application/errors/credits/CreditNotFoundError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditAlreadyPaidError } from "@domain/errors/credit/CreditAlreadyPaidError";
import { MoneyAmountInvalidError } from "@domain/errors/money/MoneyAmountInvalidError";
import { MoneyAmountNegativeError } from "@domain/errors/money/MoneyAmountNegativeError";
import { MoneyCurrencyMismatchError } from "@domain/errors/money/MoneyCurrencyMismatchError";
import { MoneyCurrencyMissingError } from "@domain/errors/money/MoneyCurrencyMissingError";

type Props = {} & Pick<CreditEntity, "id">;

export class GrantCreditUsecase {
  constructor(private readonly creditRepository: CreditRepository) {}
  public async execute({
    id,
  }: Props): Promise<
    | CreditEntity
    | CreditNotFoundError
    | CreditAlreadyPaidError
    | MoneyCurrencyMissingError
    | MoneyCurrencyMismatchError
    | MoneyAmountInvalidError
    | MoneyAmountNegativeError
  > {
    const credit = await this.creditRepository.findById(id);
    if (!credit) return new CreditNotFoundError();

    if (credit.isFullyPaid()) return new CreditAlreadyPaidError(credit.id);

    const updatedCredit = credit.payMonthly();
    if (updatedCredit instanceof Error) return updatedCredit;
    await this.creditRepository.update(credit);
    return credit;
  }
}
