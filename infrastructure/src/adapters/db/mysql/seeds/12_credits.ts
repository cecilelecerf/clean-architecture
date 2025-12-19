import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { rawCredits } from "../../seeds/credits";
import { pick } from "./utils";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

export async function generateCredits(
  mysqlClient: MySQLClient,
  clients: UserEntity[]
): Promise<CreditEntity[]> {
  console.log("-- Création des Crédits --");

  const creditRepository = new CreditRepositoryMySQL(mysqlClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const credits = [];
  for (const raw of rawCredits) {
    try {
      const client = pick(clients);

      const initialAmount = Money.create({
        amount: raw.initialAmount,
        currency: raw.currency,
      });
      if (initialAmount instanceof Error) {
        console.warn(initialAmount);
        continue;
      }

      const interestRate = Percentage.create(raw.interestRate);
      if (interestRate instanceof Error) {
        console.warn(interestRate);
        continue;
      }

      const insuranceRate = Percentage.create(raw.insuranceRate);
      if (insuranceRate instanceof Error) {
        console.warn(insuranceRate);
        continue;
      }

      const tempCredit = CreditEntity.from({
        id: "temp",
        userId: client.id,
        initialAmount,
        interestRate,
        insuranceRate,
        durationMonths: raw.durationMonths,
        startDate: raw.startDate,
        monthlyPayment: initialAmount,
        remainingBalance: initialAmount,
        createdAt: clockService.now(),
        updatedAt: clockService.now(),
      });

      const monthlyPayment = tempCredit.calculateMonthlyPayment();
      if (monthlyPayment instanceof Error) {
        console.warn(monthlyPayment);
        continue;
      }

      const credit = CreditEntity.from({
        id: uuidService.generate(),
        userId: client.id,
        initialAmount: initialAmount,
        interestRate: interestRate,
        insuranceRate: insuranceRate,
        durationMonths: raw.durationMonths,
        startDate: raw.startDate,
        monthlyPayment: monthlyPayment,
        remainingBalance: initialAmount,
        createdAt: clockService.now(),
        updatedAt: clockService.now(),
      });

      credits.push(credit);
      await creditRepository.save(credit);
      console.log(credit.id);
    } catch (err) {
      console.error("Error creating credit from raw", raw, err);
    }
  }
  return credits;
}
