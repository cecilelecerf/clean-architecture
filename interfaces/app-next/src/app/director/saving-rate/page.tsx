"use client"

import { newSavingsrate } from "@/utils/endpoint/savingsrateEndpoints"
import { useState } from "react"
import { endpoints } from '@/utils/endpoint';
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import FormWrapper, { Field as TField } from '@/components/FromWrapper';
import router from "next/router";

export default function SavingsRatePage(){
    const [field, setField]= useState<newSavingsrate>({
        rate: 0,
        effectiveDate: ''
    })
    const mutation = useMutation(endpoints.savingrate.create());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!field.rate || !field.effectiveDate ) {
            return;
        }

        const effectiveDateISO = new Date(field.effectiveDate).toISOString();

        mutation.mutate({ rate: field.rate, effectiveDate: effectiveDateISO}, { onSuccess: () => router.push(`/savingsrate`) });
    };

    const fields: TField[] = [
        {
            label: 'Taux',
            type: 'number',
            get: field.rate.toString(),
            set: (e) =>
                setField((prev) => ({
                    ...prev,
                    rate: Number(e),
                })),
            numberOptions: {
                min: 0,
                step: 0.01,
            },
        },
        {
            label: 'Date d\'entrée en vigueur',
            type: 'date',
            get: field.effectiveDate,
            set: (e) =>
                setField((prev) => ({
                    ...prev,
                    effectiveDate: e as string,
                })),
        },
    ]

    return(
        <form onSubmit={handleSubmit}>
            <FormWrapper
                title="Nouveau taux d'épargne"
                description="Créer un taux d'épargne"
                fields={fields}
                button="Enregistrer"
                loading={mutation.isPending}
            ></FormWrapper>
        </form>
    )
}