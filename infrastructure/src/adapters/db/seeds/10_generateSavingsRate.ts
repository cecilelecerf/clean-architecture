import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { SeedSavingsRateUseCase } from "@application/usecases/seeds/SeedSavingsRateUseCase";
import { rawSavingsRate } from "./raw/savingsrate";

export async function generateSavingsRate(
  seedSavingsRateUseCase: SeedSavingsRateUseCase
): Promise<SavingsRateEntity[]> {
  console.log("-- Création des Taux d'Épargnes --");

  const savingsRates: SavingsRateEntity[] = [];

  for (const raw of rawSavingsRate) {
    try {
      const savingsRate = await seedSavingsRateUseCase.execute({
        rate: raw.rate,
        effectiveDate: raw.effectiveDate,
      });

      savingsRates.push(savingsRate);
      console.log(
        `  ✅ Savings rate created: ${savingsRate.rate.value}% (${savingsRate.id})`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create savings rate:`, err);
    }
  }

  console.log(
    `✅ Savings rates seed completed: ${savingsRates.length} created\n`
  );
  return savingsRates;
}
