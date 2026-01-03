"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { endpoints } from "@/utils/endpoint";
import { UpdateFormule } from "@/utils/endpoint/formuleEndpoints";
import FormWrapper, { Field as TField } from "@/components/FromWrapper";
import { FormuleDTO, FormuleTypes } from "@infrastructure/types/formule";

export const UpdateFormuleForm = ({ formule, types }: { formule: FormuleDTO, types: FormuleTypes[] }) => {
  const router = useRouter();


  const typeOptions = types.map((t) => ({
    label: t.label,
    value: t.value,
  }));

  const [field, setField] = useState<UpdateFormule>({
    interestRate: formule.interestRate,
    insuranceRate: formule.insuranceRate,
    type: formule.type,
    label: formule.label,
    description: formule.description,
    minAmount: formule.minAmount,
    maxAmount: formule.maxAmount,
    currency: formule.currency,
    isActive: formule.isActive,
  });

  const mutation = useMutation(
    endpoints.formules.update({ formuleId: formule.id })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!field.type || !field.interestRate) return;

    mutation.mutate(field, { onSuccess: () => router.push(`/director/formules/${formule.id}`) });
  };


  const fields: TField[] = [
    {
      label: "Taux d'intérêt",
      type: "number",
      get: field.interestRate.toString(),
      set: (e) =>
        setField((prev) => ({
          ...prev,
          interestRate: Number(e),
        })),
      numberOptions: {
        min: 0,
        step: 0.01,
      },
    },
    {
      label: 'Taux d\'assurance',
      type: 'number',
      get: field.insuranceRate.toString(),
      set: (e) =>
        setField((prev) => ({
          ...prev,
          insuranceRate: Number(e),
        })),
      numberOptions: {
        min: 0,
        step: 0.01,
      },
    },
    {

      label: "Type de prêt",
      type: "select",
      placeholder: "Sélectionnez un type",
      get: field.type,
      set: (value) =>
        setField(prev => ({
          ...prev,
          type: value as string,
        })),
      options: typeOptions,
    },
    {
      label: "Label",
      type: "text",
      get: field.label,
      set: (e) =>
        setField((prev) => ({
          ...prev,
          label: e as string,
        })),
    },
    {
      label: "Description",
      type: "textarea",
      get: field.description,
      set: (e) =>
        setField((prev) => ({
          ...prev,
          description: e as string,
        })),
    },
    {
      label: 'Montant minimum',
      type: 'number',
      get: field.minAmount.toString(),
      set: (e) =>
        setField((prev) => ({
          ...prev,
          minAmount: Number(e),
        })),
      numberOptions: {
        min: 0,
        step: 1,
      },
    },
    {
      label: 'Montant maximum',
      type: 'number',
      get: field.maxAmount.toString(),
      set: (e) =>
        setField((prev) => ({
          ...prev,
          maxAmount: Number(e),
        })),
      numberOptions: {
        min: 0,
        step: 1,
      },
    },
    {
      label: "Devise",
      type: "select",
      get: field.currency,
      set: (e) =>
        setField((prev) => ({
          ...prev,
          currency: e as string,
        })),
      options: [
        { label: "Euro", value: "EUR", icon: "" },
        { label: "Dollar américain", value: "USD", icon: "" },
        { label: "Livre sterling", value: "GBP", icon: "" },
      ]
    },
    {
      label: "Formule active",
      type: "checkbox",
      get: field.isActive ? ["active"] : [],
      set: (e) =>
        setField((prev) => ({
          ...prev,
          isActive: Array.isArray(e) && e.includes("active"),
        })),
      options: [
        { label: "Active", value: "active", icon: "" },
      ],
    }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <FormWrapper
        title="Modifier la formule"
        description="Mettre à jour la formule de prêt"
        fields={fields}
        button="Enregistrer"
        loading={mutation.isPending}
      />
    </form>
  );
}
