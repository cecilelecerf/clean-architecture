"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Percent, FileText, Coins } from "lucide-react";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { NewFormule, newFormuleSchema } from "@infrastructure/types/formule";


export const StepFormuleForm = () => {
    const query = useQuery(endpoints.formules.getTypes());
    const mutation = useMutation(endpoints.formules.create());
    const router = useRouter()
    const t = useTranslations("director.credits.formulas.new.form");

    const typeOptions =
        query.data?.map((t) => ({
            label: t.label,
            value: t.value,
        })) ?? [];
    const form = useForm<NewFormule>({
        resolver: zodResolver(newFormuleSchema),
        defaultValues: {
            maxAmount: 0,
            minAmount: 0,
            currency: "",
            description: "",
            label: "",
            type: "",
            insuranceRate: 0,
            interestRate: 0
        },
    });
    const sections: Section<NewFormule>[] = [
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
    const handleSubmit = (values) => {
        mutation.mutate(
            {
                interestRate: values.interestRate,
                insuranceRate: values.insuranceRate,
                type: values.type,
                label: values.label,
                description: values.description,
                minAmount: values.minAmount,
                maxAmount: values.maxAmount,
                currency: values.currency
            },
            {
                onSuccess: (data) => {
                    router.push(`/director/formules/${data.id}`);
                },
            }
        );
    }

    return (
        <FormWrapper<NewFormule>
            title={t("title")}
            description={t("description")}
            data={sections}
            labelButton={t("button")}
            loading={mutation.isPending}
            onSubmit={handleSubmit}
            form={form}
        />
    );
};
