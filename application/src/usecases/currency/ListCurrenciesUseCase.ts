import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";
import { CurrencyToDTO } from "@domain/entities/CurrencyEntity";

export class ListCurrenciesUseCase {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async execute(): Promise<CurrencyToDTO[]> {
    return (await this.currencyRepository.findAll()).map((currency) =>
      currency.toDTO()
    );
  }
}
