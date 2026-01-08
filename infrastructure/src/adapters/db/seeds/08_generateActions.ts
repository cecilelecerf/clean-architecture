import { ActionEntity } from "@domain/entities/ActionEntity";
import { SeedActionUseCase } from "@application/usecases/seeds/SeedActionUseCase";
import { rawActions } from "./raw/action";

export async function generateActions(
  seedActionUseCase: SeedActionUseCase
): Promise<ActionEntity[]> {
  console.log("-- Création des Actions --");

  const actions: ActionEntity[] = [];

  for (const raw of rawActions) {
    try {
      const action = await seedActionUseCase.execute({
        ISIN: raw.ISIN,
        name: raw.name,
        symbol: raw.symbol,
        market: raw.market,
        activitySector: raw.activitySector,
        price: raw.current_price,
        currency: raw.currency,
        isAvailable: raw.isAvailable,
        createdAt: raw.createdAt,
        updatedAt: raw.createdAt,
        quantity: raw.totalNb,
      });

      actions.push(action);
      console.log(`  ✅ Action created: ${action.name} (${action.ISIN})`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to create action ${raw.ISIN}:`, err);
    }
  }

  console.log(`✅ Actions seed completed: ${actions.length} created\n`);
  return actions;
}
