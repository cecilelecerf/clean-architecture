import { ActionEntity } from "@domain/entities/ActionEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { rawActions } from "../../seeds/action";
import { Money } from "@domain/values/Money";

export async function generateActions(
  mysqlClient: MySQLClient
): Promise<ActionEntity[]> {
  console.log("-- Création des Actions --");
  const actionRepository = new ActionRepositoryMySQL(mysqlClient);

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
      actionRepository.save(action);
      console.log(action.ISIN);
    } catch (err) {
      console.error("Error creating action from raw", raw, err);
    }
  }
  return actions;
}
