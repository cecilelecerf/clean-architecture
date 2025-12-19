import { ActionEntity } from "@domain/entities/ActionEntity";
import { MongoClient } from "@infrastructure/adapters/db/MongoClient";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { rawActions } from "../../seeds/action";
import { Money } from "@domain/values/Money";

export async function generateActions(
  mongoClient: MongoClient
): Promise<ActionEntity[]> {
  console.log("-- Création des Actions --");
  const actionRepository = new ActionRepositoryMongo(mongoClient);

  const actions = [];
  for (const raw of rawActions) {
    try {
      const currentPrice = Money.create({
        amount: raw.current_price,
        currency: raw.currency,
      });
      if (currentPrice instanceof Error) {
        console.warn(currentPrice);
        continue;
      }

      const action = ActionEntity.from({
        ISIN: raw.ISIN,
        name: raw.name,
        totalNb: raw.totalNb,
        symbol: raw.symbol,
        market: raw.market,
        activitySector: raw.activitySector,
        currentPrice,
        isAvailable: raw.isAvailable,
        createdAt: raw.createdAt,
        updatedAt: raw.createdAt,
      });

      actions.push(action);
      await actionRepository.save(action);
      console.log(action.ISIN);
    } catch (err) {
      console.error("Error creating action from raw", raw, err);
    }
  }
  return actions;
}
