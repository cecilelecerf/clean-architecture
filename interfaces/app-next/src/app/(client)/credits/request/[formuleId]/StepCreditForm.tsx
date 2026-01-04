"use client";
import FormWrapper, { Field } from "@/components/FromWrapper";

type CreditFormData = {
  amount: string;
  startDate: string;
  durationMonths: string;
};

export const StepCreditForm = ({ data, setData, onSubmit, loading, minAmount, maxAmount }: { data: CreditFormData, setData: (data: Partial<CreditFormData>) => void, onSubmit: () => void, loading: boolean, minAmount?: number, maxAmount?: number }) => {
  const getMinStartDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const isAmountValid = () => {
    const value = Number(data.amount);
    if (Number.isNaN(value)) return false;

    if (minAmount !== undefined && value < minAmount) return false;
    if (maxAmount !== undefined && value > maxAmount) return false;

    return true;
  };

  const fields: Field[] = [
    {
      label: "Montant souhaité",
      type: "number",
      get: data.amount,
      set: (v) => setData({ amount: v as string }),
      numberOptions: {
        min: minAmount ?? 100,
        max: maxAmount ?? undefined,
        step: 100,
      },
    },
    {
      label: "Date de début",
      type: "date",
      get: data.startDate,
      set: (v) => setData({ startDate: v as string }),
      numberOptions: { min: getMinStartDate() },
    },
    {
      label: `Durée (mois)${data.durationMonths && Number(data.durationMonths) > 0
        ? ` (${Math.floor(Number(data.durationMonths) / 12)} an${Number(data.durationMonths) >= 24 ? "s" : ""
        })`
        : ""
        }`,
      type: "number",
      get: data.durationMonths,
      set: (v) => setData({ durationMonths: v as string }),
      numberOptions: { min: 1 },
    },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isAmountValid()) return;
        onSubmit();
      }}>

      <FormWrapper
        title="Informations du crédit"
        description="Renseignez les détails de votre crédit"
        fields={fields}
        button="Envoyer la demande"
        loading={loading}
      />

      {!isAmountValid() && data.amount && (
        <p className="text-sm text-red-500 mt-1">
          Le montant doit être compris entre {minAmount?.toLocaleString()} € et {maxAmount?.toLocaleString()} €
        </p>
      )}
    </form>
  );
}
