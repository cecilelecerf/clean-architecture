import { CurrencyNotFoundError } from "@application/errors/currency/CurrencyNotFountError";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { CurrencyEntity } from "@domain/entities/CurrencyEntity";

export class CurrencyConversionService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async convert(
    amount: number,
    fromCode: string,
    toCode: string
  ): Promise<number | CurrencyNotFoundError> {
    const fromCurrency = await this.currencyRepository.findByCode(fromCode);
    if (!fromCurrency) return new CurrencyNotFoundError(fromCode);

    const toCurrency = await this.currencyRepository.findByCode(toCode);
    if (!toCurrency) return new CurrencyNotFoundError(toCode);

    return CurrencyEntity.convert(amount, fromCurrency, toCurrency);
  }
}
