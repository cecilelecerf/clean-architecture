"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { endpoints } from "@/utils/endpoint";
import FormWrapper, { Section } from "@/components/FormWrapper";

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
import { useTranslations } from "next-intl";


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

  const t = useTranslations("director.credits.formulas.update");

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
      title: t("rates.title"),
      description: t("rates.description"),
      icon: Percent,
      data: {
        interestRate: {
          label: t("rates.fields.interestRate"),
          type: "number",
        },
        insuranceRate: {
          label: t("rates.fields.insuranceRate"),
          type: "number",
        },
      },
    },
    {
      title: t("information.title"),
      description: t("information.description"),
      icon: FileText,
      data: {
        type: {
          label: t("information.fields.type"),
          type: "select",
          options: typeOptions,
        },
        label: {
          label: t("information.fields.label"),
          type: "text",
        },
        description: {
          label: t("information.fields.description"),
          type: "textarea",
        },
      },
    },
    {
      title: t("amounts.title"),
      description: t("amounts.description"),
      icon: Coins,
      data: {
        minAmount: {
          label: t("amounts.fields.minAmount"),
          type: "number",
        },
        maxAmount: {
          label: t("amounts.fields.maxAmount"),
          type: "number",
        },
        currency: {
          label: t("amounts.fields.currency"),
          type: "select",
          options: [
            { label: t("options.currencies.EUR"), value: "EUR" },
            { label: t("options.currencies.USD"), value: "USD" },
            { label: t("options.currencies.GBP"), value: "GBP" },
          ],
        },
      },
    },
    {
      title: t("settings.title"),
      description: t("settings.description"),
      icon: Settings,
      data: {
        isActive: {
          label: t("settings.fields.isActive"),
          type: "switch",
        },
      },
    },
  ];

  return (
    <FormWrapper<UpdateFormule>
      title={t("title")}
      description={t("description")}
      form={form}
      data={sections}
      labelButton={t("button")}
      loading={mutation.isPending}
      onSubmit={handleSubmit}
      showBackButton
    />
  );
};
