import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { rawSavingsRate } from "../../seeds/savingsrate";
import { Percentage } from "@domain/values/Percentage";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

export async function generateSavingsRate(
  mysqlClient: MySQLClient
): Promise<SavingsRateEntity[]> {
    console.log("-- Création des Taux d'Épargnes  --");

    const savingsRateRepository = new SavingsRateRepositoryMySQL(mysqlClient);
    const uuidService = new NodeUuidService();
    const clockService = new SystemClockService();

    const savingsrate = [];
    for (const raw of rawSavingsRate) {
        try {
            const rate = Percentage.create(raw.rate);
            if (rate instanceof Error) {
                console.warn(rate);
                continue;
            }
        
            const savingrate = SavingsRateEntity.from({
                id: uuidService.generate(),
                rate: rate,
                effectiveDate: raw.effectiveDate,
                createdAt: clockService.now()
            });
                
            savingsrate.push(savingrate);
            await savingsRateRepository.save(savingrate);
            console.log(savingrate.id);
        } catch (err) {
            console.error("Error creating saving rate from raw", raw, err);
        }
    }
    return savingsrate;
}