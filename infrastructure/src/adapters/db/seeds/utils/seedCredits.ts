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

    for (const [index, creditType] of allCreditTypes.entries()) {
      try {
        const randomCredit = generateRandomCredit();

        const formule = selectFormuleCredit(
          formuleCredits,
          randomCredit.formuleCreditType,
          randomCredit.initialAmount
        );

        if (!formule) {
          console.warn(
            `  ⚠️  Aucune formule trouvée pour ${randomCredit.formuleCreditType} avec montant ${randomCredit.initialAmount}€`
          );
          continue;
        }

        const credit = await seedCreditUseCase.execute({
          userId,
          advisorId: null,
          formuleCreditId: formule.id,
          initialAmount: randomCredit.initialAmount,
          currency: randomCredit.currency,
          durationMonths: randomCredit.durationMonths,
          creditType,
        });

        const typeLabel = formatCreditTypeLabel(creditType);

        console.log(
          `  ✅ Crédit créé: ${credit.id.slice(0, 8)} - Formule: ${
            formule.label
          } - ${typeLabel} - Début: ${
            credit.startDate.toISOString().split("T")[0]
          }`
        );
      } catch (err) {
        console.warn(`  ⚠️  Échec création crédit:`, err);
      }
    }
  } else {
    const creditsCount = Math.floor(Math.random() * 4) + 1;
    console.log(`  💳 Création de ${creditsCount} crédit(s) aléatoire(s)`);

    for (let i = 0; i < creditsCount; i++) {
      try {
        const random = Math.random();
        let creditType: SeedCreditType;

        if (random < 0.35) {
          creditType = "active";
        } else if (random < 0.55) {
          creditType = "future";
        } else if (random < 0.75) {
          creditType = "pending";
        } else if (random < 0.9) {
          creditType = "refused";
        } else {
          creditType = "completed";
        }

        const randomCredit = generateRandomCredit();

        const formule = selectFormuleCredit(
          formuleCredits,
          randomCredit.formuleCreditType,
          randomCredit.initialAmount
        );

        if (!formule) {
          console.warn(
            `  ⚠️  Aucune formule trouvée pour ${randomCredit.formuleCreditType} avec montant ${randomCredit.initialAmount}€`
          );
          continue;
        }

        const credit = await seedCreditUseCase.execute({
          userId,
          advisorId: null,
          formuleCreditId: formule.id,
          initialAmount: randomCredit.initialAmount,
          currency: randomCredit.currency,
          durationMonths: randomCredit.durationMonths,
          creditType,
        });

        const typeLabel = formatCreditTypeLabel(creditType);

        console.log(
          `  ✅ Crédit créé: ${credit.id.slice(0, 8)} - Formule: ${
            formule.label
          } - ${typeLabel} - Début: ${
            credit.startDate.toISOString().split("T")[0]
          }`
        );
      } catch (err) {
        console.warn(`  ⚠️  Échec création crédit:`, err);
      }
    }
  }
}

function generateRandomCredit(): {
  initialAmount: number;
  currency: string;
  durationMonths: number;
  formuleCreditType: string;
} {
  const creditTypes = [
    "IMMOBILIER",
    "CONSOMMATION",
    "PROFESSIONNEL",
    "AUTO",
    "AUTRE",
  ];
  const type = creditTypes[Math.floor(Math.random() * creditTypes.length)];

  let amount: number;
  let duration: number;

  switch (type) {
    case "IMMOBILIER":
      amount = Math.floor(Math.random() * 450000) + 50000;
      duration = Math.floor(Math.random() * 180) + 120;
      break;

    case "CONSOMMATION":
      amount = Math.floor(Math.random() * 49000) + 1000;
      duration = Math.floor(Math.random() * 72) + 12;
      break;

    case "PROFESSIONNEL":
      amount = Math.floor(Math.random() * 190000) + 10000;
      duration = Math.floor(Math.random() * 96) + 24;
      break;

    case "AUTO":
      amount = Math.floor(Math.random() * 72000) + 3000;
      duration = Math.floor(Math.random() * 60) + 24;
      break;

    case "AUTRE":
      amount = Math.floor(Math.random() * 44000) + 1000;
      duration = Math.floor(Math.random() * 48) + 12;
      break;

    default:
      amount = 10000;
      duration = 48;
  }

  return {
    initialAmount: amount,
    currency: "EUR",
    durationMonths: duration,
    formuleCreditType: type,
  };
}

function formatCreditTypeLabel(creditType: SeedCreditType): string {
  switch (creditType) {
    case "active":
      return "ACTIF";
    case "future":
      return "FUTUR";
    case "pending":
      return "EN ATTENTE";
    case "refused":
      return "REFUSÉ";
    case "completed":
      return "TERMINÉ";
    default:
      return "";
  }
}
