"use client"

import { newSavingsrateSchema } from "@/utils/endpoint/savingsrateEndpoints"
import { endpoints } from '@/utils/endpoint';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { useTranslations } from "next-intl";
import { savingsRateFormSchema, SavingsRateFormValues } from "@infrastructure/types/savingsrate";

export default function NewSavingsRatePage() {
    const router = useRouter();
    const form = useForm<SavingsRateFormValues>({
        resolver: zodResolver(savingsRateFormSchema),
    });
    const mutation = useMutation(endpoints.savingsRates.create());
    const t = useTranslations("director.saving.new");

    const handleSubmit = (values: SavingsRateFormValues) => {
        if (!values.rate || !values.effectiveDate) {
            return;
        }

        const effectiveDateISO = new Date(values.effectiveDate).toISOString();

        mutation.mutate({ rate: values.rate, effectiveDate: effectiveDateISO }, { onSuccess: () => router.push(`/directeur/taux-epargne`) });
    };

    const fields: DataInfo<SavingsRateFormValues> = {
        rate: {
            label: t("form.rate"),
            type: "number"
        },
        effectiveDate: {
            label: t("form.effectiveDate"),
            type: 'date'
        }
    }

    return (
        <FormWrapper<SavingsRateFormValues>
            title={t("title")}
            description={t("description")}
            data={fields}
            labelButton={t("button")}
            loading={mutation.isPending}
            form={form}
            onSubmit={handleSubmit}
        ></FormWrapper>
    )
}