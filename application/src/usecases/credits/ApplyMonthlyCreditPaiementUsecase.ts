import { CreditNotFoundError } from "@application/errors/credits/CreditNotFoundError";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity"; 
import { CreditAlreadyPaidError } from "@domain/errors/credit";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMismatchError, MoneyCurrencyMissingError } from "@domain/errors/money";

type Props = {} & Pick<CreditEntity, "id">;
// TODO : il y a du avoir un problème lors de la création des fichiers le nom est pas bon (je pense de ma faute dsl)
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
    // TODO : faire une vérification de qui fait la requête et son rôle
    const credit = await this.creditRepository.findById(id);
    if (!credit) return new CreditNotFoundError();

    if (credit.isFullyPaid()) return new CreditAlreadyPaidError(credit.id);

    const updatedCredit = credit.payMonthly();
    if (updatedCredit instanceof Error) return updatedCredit;
    await this.creditRepository.update(credit);
    return credit;
  }
}
