import { CurrencyNotFoundError } from "@application/errors/currency";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { CurrencyToDTO } from "@domain/entities/CurrencyEntity";

type Props = {
  code: string;
};

export class GetCurrencyByCodeUseCase {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async execute({
    code,
  }: Props): Promise<CurrencyToDTO | CurrencyNotFoundError> {
    const currency = await this.currencyRepository.findByCode(code);
    if (!currency) return new CurrencyNotFoundError(code);
    return currency.toDTO();
  }
}
