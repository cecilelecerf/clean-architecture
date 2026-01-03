"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { StepSelectAccount } from "./StepSelectAccount";
import { StepCreditForm } from "./StepCreditForm";
import { FormuleId } from "@infrastructure/types/formule";
import { AccountId } from "@infrastructure/types/account";

export default function RequestCreditPage() {
  const { formuleId } = useParams<{ formuleId: FormuleId }>();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    accountId: undefined as string | undefined,
    amount: "",
    currency: "",
    startDate: "",
    durationMonths: "",
  });

  const formuleQuery = useQuery(
    endpoints.formules.get({ formuleId })
  );

  const mutation = useMutation(endpoints.credits.create());

  const submit = () => {
    const effectiveDateISO = new Date(formData.startDate).toISOString();

    mutation.mutate(
      {
        accountId: formData.accountId as AccountId,
        formuleCreditId: formuleId as FormuleId,
        initialAmount: {
          amount: parseFloat(formData.amount),
          currency: formData.currency,
        },
        durationMonths: parseFloat(formData.durationMonths),
        startDate: effectiveDateISO
      },
      {
        onSuccess: (data) => {
          router.push(`/credits/${data.id}`);
        },
      }
    );
  };

  if (!formuleQuery.data) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {step === 1 && (
        <StepSelectAccount
          selectedAccountId={formData.accountId}
          onSelect={(accountId, currency) =>
            setFormData((prev) => ({
              ...prev,
              accountId,
              currency
            }))
          }
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepCreditForm
          data={formData}
          setData={(partial) =>
            setFormData((prev) => ({ ...prev, ...partial }))
          }
          onSubmit={submit}
          loading={mutation.isPending}
          minAmount={formuleQuery.data.minAmount ?? undefined}
          maxAmount={formuleQuery.data.maxAmount ?? undefined}
        />
      )}
    </div>
  );
}
