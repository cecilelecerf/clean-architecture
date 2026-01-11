"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { DollarSign, } from "lucide-react";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionId, NewAction, newActionSchema, UpdateAction, updateActionSchema } from "@infrastructure/types/action";
import z from "zod";
import { useTranslations } from "next-intl";

export const CreateActionForm = ({ sections, tForm, t }: { sections: Section<NewAction>[], tForm: ReturnType<typeof useTranslations>, t: ReturnType<typeof useTranslations>; }) => {

    const form = useForm<NewAction>({
        resolver: zodResolver(newActionSchema),
        mode: "onChange",
    });
    const currenciesQuery = useQuery(endpoints.currencies.getAll());

    const updateSection = [{
        title: t("initialValue.title"),
        description: t("initialValue.description"),
        icon: DollarSign,
        data: {
            quantity: { label: t("initialValue.fields.quantity"), type: "number" },
            priceAmount: { label: t("initialValue.fields.priceAmount"), type: "number" },
            priceCurrency: {
                label: t("initialValue.fields.priceCurrency"), type: "select",
                options:
                    currenciesQuery.status === "success" ?
                        currenciesQuery.data.map((d) => ({ label: ` ${d.code} - ${d.name}(${d.symbol})`, value: d.code, })) : [],
            },
        },
    }]
    const createMutation = useMutation(endpoints.actions.create());
    return (
        <FormWrapper<NewAction>
            title={tForm("title")}
            form={form}
            data={[...updateSection, ...sections,] as Section<UpdateAction>[]}
            labelButton={tForm("button")}
            loading={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate({ payload: values })}
        />
    );
};
export const EditActionForm = ({ isin, sections, t }: { isin: ActionId, sections: Section<UpdateAction>[], t: ReturnType<typeof useTranslations>; }) => {

    const form = useForm<z.infer<typeof updateActionSchema>>({
        resolver: zodResolver(updateActionSchema),
    });

    const updateMutation = useMutation(
        endpoints.actions.update({ actionIsin: isin })
    );

    return (
        <FormWrapper<UpdateAction>
            title={t("title")}
            form={form}
            labelButton={t("button")}
            loading={updateMutation.isPending}
            data={sections}
            onSubmit={(values) => updateMutation.mutate({ payload: values })}
        />
    );
};