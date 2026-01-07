"use client"

import { useState } from "react"
import { endpoints } from '@/utils/endpoint';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { $brand } from "zod";
import { StepFormuleForm } from "./StepFormuleForm";
import { StepSelectAccount } from "./StepSelectAcount";

export default function NewFormulePage() {

  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    accountId: undefined as string | undefined,
    interestRate: 0,
    insuranceRate: 0,
    type: "",
    label: "",
    description: "",
    minAmount: 0,
    maxAmount: 0,
    currency: ""
  });

  const mutation = useMutation(endpoints.formules.create());

  const submit = () => {
    if (
      !formData.type.trim() ||
      !formData.interestRate ||
      !formData.insuranceRate ||
      !formData.label.trim() ||
      !formData.description.trim()
    ) {
      return;
    }

    mutation.mutate(
      {
        accountId: formData.accountId as string & $brand<"account">,
        interestRate: formData.interestRate,
        insuranceRate: formData.insuranceRate,
        type: formData.type,
        label: formData.label,
        description: formData.description,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        currency: formData.currency
      },
      {
        onSuccess: (data) => {
          router.push(`/director/formules/${data.id}`);
        },
      }
    );
  };

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
        <StepFormuleForm
          data={formData}
          setData={(partial) =>
            setFormData((prev) => ({ ...prev, ...partial }))
          }
          onSubmit={submit}
          loading={mutation.isPending}
        />
      )}
    </div>
  )
}