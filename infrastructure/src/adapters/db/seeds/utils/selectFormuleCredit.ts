import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";

export function selectFormuleCredit(
  formuleCredits: FormuleCreditEntity[],
  type: string,
  amount: number
): FormuleCreditEntity | null {
  const validFormules = formuleCredits.filter(
    (formule) =>
      formule.isActive &&
      formule.type === type &&
      (!formule.minAmount || amount >= formule.minAmount.amount) &&
      (!formule.maxAmount || amount <= formule.maxAmount.amount)
  );

  if (validFormules.length === 0) {
    return null;
  }

  return validFormules[Math.floor(Math.random() * validFormules.length)];
}
