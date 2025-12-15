import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { MongoClient } from "../../MongoClient";
import { SavingsRateRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/SavingsRateRepositoryMongo";
import { rawSavingsRate } from "../../seeds/savingsrate";
import { Percentage } from "@domain/values/Percentage";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

export async function generateSavingsRateMongo(
  mongoClient: MongoClient
): Promise<SavingsRateEntity[]> {
  console.log("-- Création des Taux d'Épargnes (Mongo) --");

  await mongoClient.connect();

  const savingsRateRepository = new SavingsRateRepositoryMongo(mongoClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const savingsRates: SavingsRateEntity[] = [];

  for (const raw of rawSavingsRate) {
    try {
      const rate = Percentage.create(raw.rate);
      if (rate instanceof Error) {
        console.warn(rate);
        continue;
      }

      const savingsRate = SavingsRateEntity.from({
        id: uuidService.generate(),
        rate,
        effectiveDate: raw.effectiveDate,
        createdAt: clockService.now(),
      });

      savingsRates.push(savingsRate);
      await savingsRateRepository.save(savingsRate);
      console.log(savingsRate.id);
    } catch (err) {
      console.error(
        "Error creating savings rate from raw",
        raw,
        err
      );
    }
  }

  return savingsRates;
}
