"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";

import { Percent, FileText, Coins } from "lucide-react";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { NewFormule, newFormuleSchema } from "@/utils/endpoint/formuleEndpoints";
import { zodResolver } from "@hookform/resolvers/zod";

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
            title: "Taux",
            description: "Paramètres financiers du prêt",
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
    ];

    return (
        <FormWrapper<Omit<NewFormule, "accountId">>
            title="Nouveau prêt"
            description="Créer une formule de prêt"
            data={sections}
            labelButton="Enregistrer"
            loading={loading}
            onSubmit={onSubmit}
            form={form}
        />
    );
};
