"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { StepSelectAccount } from "./StepSelectAccount";
import { StepCreditForm } from "./StepCreditForm";
import { FormuleDTO, FormuleId } from "@infrastructure/types/formule";
import { AccountId } from "@infrastructure/types/account";
import { match } from "ts-pattern";


export default function RequestCreditPage() {
  const { formuleId } = useParams<{ formuleId: FormuleId }>();

  const query = useQuery(endpoints.formules.get({ formuleId }))
  return match(query)
    .with(({ status: "error" }), () => "error")
    .with(({ status: "pending" }), () => "pending")
    .with(({ status: "success" }), ({ data: formule }) => <Content formule={formule} />)
    .exhaustive()
}


const Content = ({ formule }: { formule: FormuleDTO }) => {
  const [step, setStep] = useState<0 | 1>(0);

  const [info, setInfo] = useState<{ accountId: AccountId | null, currency: string | null }>({ accountId: null, currency: null })


  return (
    <div className="max-w-2xl mx-auto">
      {step === 0 && (
        <StepSelectAccount
          selectedAccountId={info.accountId}
          onSelect={(accountId, currency) => setInfo({ accountId, currency })}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <StepCreditForm
          formule={formule}
          info={info}
        />
      )}
    </div>
  );
}