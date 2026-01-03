import {
  SeedCreditType,
  SeedCreditUseCase,
} from "@application/usecases/seeds/SeedCreditUseCase";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { selectFormuleCredit } from "./selectFormuleCredit";

export async function seedCredits(
  seedCreditUseCase: SeedCreditUseCase,
  userId: string,
  formuleCredits: FormuleCreditEntity[],
  rawCredits: any[],
  isFirstClient?: boolean
): Promise<void> {
  const allCreditTypes: SeedCreditType[] = [
    "active",
    "pending",
    "future",
    "refused",
    "completed",
  ];

  if (isFirstClient) {
    console.log("  📌 Premier client: création d'un crédit de chaque type");

    const creditsToCreate =
      rawCredits.length >= 5
        ? rawCredits
        : [...rawCredits, ...rawCredits, ...rawCredits].slice(0, 5);

    for (const [index, rawCredit] of creditsToCreate.entries()) {
      try {
        const creditType = allCreditTypes[index % allCreditTypes.length];

        const formule = selectFormuleCredit(
          formuleCredits,
          rawCredit.formuleCreditType,
          rawCredit.initialAmount
        );

        if (!formule) {
          console.warn(
            `  ⚠️  No suitable formule found for ${rawCredit.formuleCreditType} with amount ${rawCredit.initialAmount}`
          );
          continue;
        }

        const credit = await seedCreditUseCase.execute({
          userId,
          advisorId: null,
          formuleCreditId: formule.id,
          initialAmount: rawCredit.initialAmount,
          currency: rawCredit.currency,
          durationMonths: rawCredit.durationMonths,
          creditType,
        });

        const typeLabel = formatCreditTypeLabel(creditType);

        console.log(
          `  ✅ Credit created: ${credit.id} - Formule: ${
            formule.label
          } - Status: ${credit.status} ${typeLabel} - Start: ${
            credit.startDate.toISOString().split("T")[0]
          }`
        );
      } catch (err) {
        console.warn(`  ⚠️  Failed to create credit:`, err);
      }
    }
  } else {
    for (const [creditIndex, rawCredit] of rawCredits.entries()) {
      try {
        const random = Math.random();
        let creditType: SeedCreditType;

        if (random < 0.3) {
          creditType = "active";
        } else if (random < 0.5) {
          creditType = "future";
        } else if (random < 0.7) {
          creditType = "pending";
        } else if (random < 0.85) {
          creditType = "refused";
        } else {
          creditType = "completed";
        }

        const formule = selectFormuleCredit(
          formuleCredits,
          rawCredit.formuleCreditType,
          rawCredit.initialAmount
        );

        if (!formule) {
          console.warn(
            `  ⚠️  No suitable formule found for ${rawCredit.formuleCreditType} with amount ${rawCredit.initialAmount}`
          );
          continue;
        }

        const credit = await seedCreditUseCase.execute({
          userId,
          advisorId: null,
          formuleCreditId: formule.id,
          initialAmount: rawCredit.initialAmount,
          currency: rawCredit.currency,
          durationMonths: rawCredit.durationMonths,
          creditType,
        });

        const typeLabel = formatCreditTypeLabel(creditType);

        console.log(
          `  ✅ Credit created: ${credit.id} - Formule: ${
            formule.label
          } - Status: ${credit.status} ${typeLabel} - Start: ${
            credit.startDate.toISOString().split("T")[0]
          }`
        );
      } catch (err) {
        console.warn(`  ⚠️  Failed to create credit:`, err);
      }
    }
  }
}

function formatCreditTypeLabel(creditType: SeedCreditType): string {
  switch (creditType) {
    case "active":
      return "(ACTIF - En cours)";
    case "future":
      return "(FUTUR - Accepté, pas encore démarré)";
    case "pending":
      return "(EN ATTENTE - À valider)";
    case "refused":
      return "(REFUSÉ)";
    case "completed":
      return "(TERMINÉ - Remboursé)";
    default:
      return `Sorry, we are out of.`;
  }
}
