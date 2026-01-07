"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { endpoints } from "@/utils/endpoint";
import FormWrapper, { Section } from "@/components/erfer";

import {
  FormuleDTO,
  FormuleTypes,
} from "@infrastructure/types/formule";

import {
  Percent,
  FileText,
  Coins,
  Settings,
} from "lucide-react";
import z from "zod";
import { UpdateFormule, updateFormuleSchema } from "@/utils/endpoint/formuleEndpoints";


export const UpdateFormuleForm = ({
  formule,
  types,
}: {
  formule: FormuleDTO;
  types: FormuleTypes[];
}) => {
  const router = useRouter();

  const form = useForm<UpdateFormule>({
    resolver: zodResolver(updateFormuleSchema),
  });

  const mutation = useMutation(
    endpoints.formules.update({ formuleId: formule.id })
  );

  /** 🔁 Hydratation */
  useEffect(() => {
    form.reset({
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
  }, [formule]);

  const handleSubmit = (values: UpdateFormule) => {
    mutation.mutate(values, {
      onSuccess: () =>
        router.push(`/director/formules/${formule.id}`),
    });
  };

  const typeOptions = types.map((t) => ({
    label: t.label,
    value: t.value,
  }));

  const sections: Section<UpdateFormule>[] = [
    {
      title: "Taux",
      description: "Paramètres financiers de la formule",
      icon: Percent,
      data: {
        interestRate: {
          label: "Taux d'intérêt",
          type: "number",
        },
        insuranceRate: {
          label: "Taux d'assurance",
          type: "number",
        },
      },
    },
    {
      title: "Informations",
      description: "Identification de la formule",
      icon: FileText,
      data: {
        type: {
          label: "Type de prêt",
          type: "select",
          options: typeOptions,
        },
        label: {
          label: "Label",
          type: "text",
        },
        description: {
          label: "Description",
          type: "textarea",
        },
      },
    },
    {
      title: "Montants",
      description: "Plage de montants autorisés",
      icon: Coins,
      data: {
        minAmount: {
          label: "Montant minimum",
          type: "number",
        },
        maxAmount: {
          label: "Montant maximum",
          type: "number",
        },
        currency: {
          label: "Devise",
          type: "select",
          options: [
            { label: "Euro", value: "EUR" },
            { label: "Dollar américain", value: "USD" },
            { label: "Livre sterling", value: "GBP" },
          ],
        },
      },
    },
    {
      title: "Paramètres",
      description: "État de la formule",
      icon: Settings,
      data: {
        isActive: {
          label: "Formule active",
          type: "switch",
        },
      },
    },
  ];

  return (
    <FormWrapper<UpdateFormule>
      title="Modifier la formule"
      description="Mettre à jour la formule de prêt"
      form={form}
      data={sections}
      labelButton="Enregistrer"
      loading={mutation.isPending}
      onSubmit={handleSubmit}
      showBackButton
    />
  );
};
