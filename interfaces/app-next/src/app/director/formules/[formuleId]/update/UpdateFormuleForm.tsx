"use client";

import { useEffect, useState } from "react";
import {  useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { endpoints } from "@/utils/endpoint";
import { UpdateFormule } from "@/utils/endpoint/formuleEndpoints";
import FormWrapper, { Field as TField } from "@/components/FromWrapper";
import { FormuleId } from "@infrastructure/types/formule";

export const UpdateFormuleForm = ({ formuleId }: { formuleId: FormuleId }) => {
  const router = useRouter();

  const query = useQuery(endpoints.formules.get({ formuleId }));

  const queryTypeOptions = useQuery(endpoints.formules.getTypes());
  
  const typeOptions = (queryTypeOptions.data || []).map((t) => ({
    label: t.type,
    value: t.type,
  }));

  const [field, setField] = useState<UpdateFormule>({
    interestRate: 0,
    insuranceRate: 0,
    type: '',
    label: '',
    description: '',
    minAmount: 0,
    maxAmount: 0,
    currency: '',
    isActive: true,
  });

  useEffect(() => {
    if (query.data) {
      setField({
        interestRate: query.data.interestRate,
        insuranceRate: query.data.insuranceRate,
        type: query.data.type,
        label: query.data.label,
        description: query.data.description,
        minAmount: query.data.minAmount,
        maxAmount: query.data.maxAmount,
        currency: query.data.currency,
        isActive: query.data.isActive,
      });
    }
  }, [query.data]);

  const mutation = useMutation(
    endpoints.formules.update({ formuleId })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!field.type || !field.interestRate) return;

    mutation.mutate(field , { onSuccess: () => router.push(`/director/formules/${formuleId}`) });
  };

  if (query.isLoading) return "Chargement...";
  if (query.isError) return "Erreur";

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
    // {
    //   label: "Type de prêt",
    //   type: "text",
    //   get: field.type,
    //   set: (e) =>
    //     setField((prev) => ({
    //       ...prev,
    //       type: e as string,
    //     })),
    // },
    {
      label: "Type de prêt",
      type: "creatable-select",
      placeholder: "Sélectionnez ou créez un type",
      get: field.type,
      set: (value) =>
        setField(prev => ({
          ...prev,
          type: value as string,
        })),
      options: typeOptions,
      disabled: query.isLoading,
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
      get: field.currency, // TODO: Pourquoi ma currency n'est pas séléctionné dans mon formulaire d'update ? 
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
