import { CurrencyEntity } from "@domain/entities/CurrencyEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";

const rawCurrencies = [
  { code: "USD", rate: 1.0, name: "Dollar américain" },
  { code: "EUR", rate: 0.91, name: "Euro" },
  { code: "GBP", rate: 0.78, name: "Livre sterling" },
  { code: "JPY", rate: 149.25, name: "Yen japonais" },
  { code: "CHF", rate: 0.87, name: "Franc suisse" },
  { code: "CAD", rate: 1.39, name: "Dollar canadien" },
  { code: "AUD", rate: 1.54, name: "Dollar australien" },
  { code: "CNY", rate: 7.25, name: "Yuan chinois" },
];

export async function generateCurrencies(
  currencyRepository: CurrencyRepository,
  clockService: ClockService
): Promise<CurrencyEntity[]> {
  console.log("-- Création des Devises --");

  const currencies: CurrencyEntity[] = [];

  for (const raw of rawCurrencies) {
    try {
      const currency = CurrencyEntity.create({
        code: raw.code,
        exchangeRate: raw.rate,
        createdAt: clockService.now(),
      });

      if (currency instanceof Error) {
        console.warn(
          `  ⚠️  Failed to create currency ${raw.code}:`,
          currency.message
        );
        continue;
      }

      await currencyRepository.save(currency);
      currencies.push(currency);
      console.log(
        `  ✅ Currency created: ${raw.code} (${raw.name}) - Rate: ${raw.rate}`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create currency ${raw.code}:`, err);
    }
  }

  console.log(`✅ Currencies seed completed: ${currencies.length} created\n`);
  return currencies;
}
