"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";

import { Percent, FileText, Coins } from "lucide-react";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { NewFormule, newFormuleSchema } from "@/utils/endpoint/formuleEndpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

type FormuleFormData = {
    interestRate: number;
    insuranceRate: number;
    type: string;
    label: string;
    description: string;
    minAmount?: number;
    maxAmount?: number;
    currency: string;
};

export const StepFormuleForm = ({
    data,
    setData,
    onSubmit,
    loading,
}: {
    data: FormuleFormData;
    setData: (data: Partial<FormuleFormData>) => void;
    onSubmit: () => void;
    loading: boolean;
}) => {
    const query = useQuery(endpoints.formules.getTypes());

    const t = useTranslations("director.credits.formulas.new.form");

    const typeOptions =
        query.data?.map((t) => ({
            label: t.label,
            value: t.value,
        })) ?? [];
    const form = useForm<Omit<NewFormule, "accountId">>({
        resolver: zodResolver(newFormuleSchema.omit({ accountId: true })),
        defaultValues: {
            maxAmount: data?.maxAmount ?? 100,
            minAmount: data?.maxAmount ?? 100,
            currency: data.currency,
            description: data.description,
            label: data.label,
            type: data.type,
            insuranceRate: data.insuranceRate,
            interestRate: data.interestRate
        },
    });
    const sections: Section<Omit<NewFormule, "accountId">>[] = [
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
            title: "Montants",
            description: "Plage de montants autorisés",
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
    ];

    return (
        <FormWrapper<Omit<NewFormule, "accountId">>
            title={t("title")}
            description={t("description")}
            data={sections}
            labelButton={t("button")}
            loading={loading}
            onSubmit={onSubmit}
            form={form}
        />
    );
};
