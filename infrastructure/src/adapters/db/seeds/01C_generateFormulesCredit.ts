import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { SeedFormuleCreditUseCase } from "@application/usecases/seeds/SeedFormuleCreditUseCase";
import { rawFormuleCredits } from "./raw/formule_credit";
import { IBAN } from "@domain/values/IBAN";

export async function generateFormuleCredits(
  bankAccountsIbans: IBAN[],
  seedFormuleCreditUseCase: SeedFormuleCreditUseCase
): Promise<FormuleCreditEntity[]> {
  console.log("-- Création des Formules de Crédit --");

  if (!bankAccountsIbans.length) {
    throw new Error(
      "Au moins un compte bancaire est requis pour créer des formules de crédit."
    );
  }

  const formuleCredits: FormuleCreditEntity[] = [];

  for (const [index, raw] of rawFormuleCredits.entries()) {
    try {
      const accountId = bankAccountsIbans[index % bankAccountsIbans.length];
      const formuleCredit = await seedFormuleCreditUseCase.execute({
        type: raw.type,
        label: raw.label,
        description: raw.description,
        interestRate: raw.interestRate,
        insuranceRate: raw.insuranceRate,
        minAmount: raw.minAmount,
        maxAmount: raw.maxAmount,
        currency: raw.currency,
        isActive: raw.isActive,
        accountId,
      });

      formuleCredits.push(formuleCredit);
      console.log(
        `  ✅ Formule crédit créée: ${formuleCredit.label} (${formuleCredit.type}) - ${formuleCredit.id}`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create formule credit:`, err);
    }
  }

  console.log(
    `✅ Formule credits seed completed: ${formuleCredits.length} created\n`
  );
  return formuleCredits;
}
