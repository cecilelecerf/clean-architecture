import { CreditNotFoundError } from "@application/errors/credits/CreditNotFoundError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditAlreadyPaidError } from "@domain/errors/credit/CreditAlreadyPaidError";

type Props = {} & Pick<CreditEntity, "id">;

export class GrantCreditUsecase {
  constructor(private readonly creditRepository: CreditRepository) {}

  public async execute({ id }: Props) {
    const credit = await this.creditRepository.findById(id);
    if (!credit) throw new CreditNotFoundError();

    if (credit.isFullyPaid()) throw new CreditAlreadyPaidError(credit.id);

    const updatedCredit = credit.payMonthly();
    if (updatedCredit instanceof Error) throw updatedCredit;
    await this.creditRepository.updateCredit(credit);
  }
}
