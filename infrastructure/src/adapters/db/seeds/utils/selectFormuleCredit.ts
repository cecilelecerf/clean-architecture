import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleType } from "@domain/values/FormuleType";

export function selectFormuleCredit(
  formuleCredits: FormuleCreditEntity[],
  type: string,
  amount: number
): FormuleCreditEntity | null {
  const formuleType = FormuleType.create(type);

  if (formuleType instanceof Error) {
    console.warn(
      `⚠️  Type de formule invalide: "${type}". Types valides: ${formuleType.validTypes.join(
        ", "
      )}`
    );
    return null;
  }

  const validFormules = formuleCredits.filter((formule) => {
    const isTypeMatch = formule.type.equals(formuleType);

    const isActive = formule.isActive;

    const isAmountInRange =
      (!formule.minAmount || amount >= formule.minAmount.amount) &&
      (!formule.maxAmount || amount <= formule.maxAmount.amount);

    return isActive && isTypeMatch && isAmountInRange;
  });

  if (validFormules.length === 0) {
    console.warn(
      `⚠️  Aucune formule active trouvée pour le type "${formuleType.getLabel()}" (${type}) avec le montant ${amount.toLocaleString(
        "fr-FR"
      )}€`
    );
    return null;
  }

  const randomIndex = Math.floor(Math.random() * validFormules.length);
  const selectedFormule = validFormules[randomIndex];

  console.log(
    `  🎯 Formule sélectionnée: "${selectedFormule.label}" (${selectedFormule.type.value}) - Taux: ${selectedFormule.interestRate.value}%`
  );

  return selectedFormule;
}
