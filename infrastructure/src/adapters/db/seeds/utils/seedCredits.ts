import {
  SeedCreditType,
  SeedCreditUseCase,
} from "@application/usecases/seeds/SeedCreditUseCase";

export async function seedCredits(
  seedCreditUseCase: SeedCreditUseCase,
  userId: string,
  rawCredits: any[]
): Promise<void> {
  const creditTypes: SeedCreditType[] = [
    "active", // Premier crédit : en cours depuis plusieurs mois
    "pending", // Deuxième crédit : en attente d'acceptation
    "future", // Troisième crédit : accepté mais pas encore démarré
    "refused", // Quatrième crédit : refusé
    "completed", // Cinquième crédit : terminé
  ];

  for (const [creditIndex, rawCredit] of rawCredits.entries()) {
    try {
      let creditType: SeedCreditType;

      if (creditIndex < creditTypes.length) {
        creditType = creditTypes[creditIndex];
      } else {
        const random = Math.random();
        if (random < 0.25) {
          creditType = "active";
        } else if (random < 0.4) {
          creditType = "future";
        } else if (random < 0.6) {
          creditType = "pending";
        } else if (random < 0.8) {
          creditType = "refused";
        } else {
          creditType = "completed";
        }
      }

      const credit = await seedCreditUseCase.execute({
        userId,
        advisorId: null,
        initialAmount: rawCredit.initialAmount,
        currency: rawCredit.currency,
        interestRate: rawCredit.interestRate,
        insuranceRate: rawCredit.insuranceRate,
        durationMonths: rawCredit.durationMonths,
        creditType,
      });

      const typeLabel =
        creditType === "active"
          ? "(ACTIF)"
          : creditType === "future"
          ? "(FUTUR)"
          : `(${creditType.toUpperCase()})`;

      console.log(
        `  ✅ Credit created: ${credit.id} - Status: ${
          credit.status
        } ${typeLabel} - Start: ${credit.startDate.toISOString().split("T")[0]}`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create credit:`, err);
    }
  }
}
