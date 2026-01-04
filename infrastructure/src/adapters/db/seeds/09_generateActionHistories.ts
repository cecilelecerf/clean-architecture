import { ClockService } from "@application/ports/services/ClockService";
import { SeedActionPriceHistoryUseCase } from "@application/usecases/seeds/SeedActionPriceHistoryUseCase";
import { ActionEntity } from "@domain/entities/ActionEntity";

type PricePoint = {
  price: number;
  volume: number;
};

const generatePriceHistory = (
  basePrice: number,
  days: number,
  volatility: number = 0.02
): PricePoint[] => {
  const history: PricePoint[] = [];
  let currentPrice = basePrice;

  // 0 → days = days + 1 points
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrice = currentPrice * (1 + change);

    const volume = Math.floor(Math.random() * 500_000) + 100_000;

    history.push({
      price: Math.round(currentPrice * 100) / 100,
      volume,
    });
  }

  return history;
};

export async function seedPriceHistory(
  actions: ActionEntity[],
  clockService: ClockService,
  seedActionPriceHistoryUsecase: SeedActionPriceHistoryUseCase
) {
  console.log("🌱 Début du seeding de l'historique des prix...");

  try {
    const days = 29;

    for (const action of actions) {
      const history = generatePriceHistory(
        action.currentPrice.amount,
        days,
        0.02
      );

      for (let i = 0; i < history.length; i++) {
        const date = clockService.nowMinusDays(days - i);
        const { price, volume } = history[i];

        await seedActionPriceHistoryUsecase.execute({
          isin: action.ISIN,
          date,
          price,
          volume,
        });
      }

      console.log(`✅ Historique créé pour ${action.ISIN} (${days + 1} jours)`);
    }

    console.log("✨ Seeding de l'historique terminé avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  }
}
