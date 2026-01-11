"use client"

import { NewSavingsrate, newSavingsrateSchema } from "@/utils/endpoint/savingsrateEndpoints"
import { endpoints } from '@/utils/endpoint';
import { useMutation } from "@tanstack/react-query";
import router from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { useTranslations } from "next-intl";

export default function NewSavingsRatePage() {
    const form = useForm<NewSavingsrate>({
        resolver: zodResolver(newSavingsrateSchema),
    });
    const mutation = useMutation(endpoints.savingsRates.create());
    const t = useTranslations("director.saving.new");

    const handleSubmit = (values: NewSavingsrate) => {
        if (!values.rate || !values.effectiveDate) {
            return;
        }

        const effectiveDateISO = new Date(values.effectiveDate).toISOString();

        mutation.mutate({ rate: values.rate, effectiveDate: effectiveDateISO }, { onSuccess: () => router.push(`/savingsrate`) });
    };

    const fields: DataInfo<NewSavingsrate> = {
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
        <FormWrapper<NewSavingsrate>
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