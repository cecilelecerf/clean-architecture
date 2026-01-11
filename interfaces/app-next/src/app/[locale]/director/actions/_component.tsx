"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { Building2, DollarSign, FileText, Settings } from "lucide-react";
import FormWrapper, { Section } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionId, NewAction, newActionSchema, UpdateAction, updateActionSchema } from "@infrastructure/types/action";
import z from "zod";
import { useTranslations } from "next-intl";

export const ActionForm = ({ isin }: { isin?: ActionId }) => {
    const tForm = useTranslations("director.stocks.new.form");
    const tFormUpdate = useTranslations("director.stocks.update.form");
    
    const sections = [
        {
            title: tForm("identification.title"),
            description: tForm("identification.description"),
            icon: FileText,
            data: {
                symbol: { label: tForm("identification.description.fields.symbol"), type: "text" },
                name: { label: tForm("identification.description.fields.name"), type: "text" },
            },
        },
        {
            title: tForm("market.title"),
            description: tForm("market.description"),
            icon: Building2,
            data: {
                market: {
                    label: tForm("identification.description.fields.market.label"), type: "radio",
                    options:
                        [{ label: tForm("identification.description.fields.market.options.NASDAQ"), value: "NASDAQ" },
                        { label: tForm("identification.description.fields.market.options.NYSE"), value: "NYSE" },
                        { label: tForm("identification.description.fields.market.options.EURONEXT_PARIS"), value: "Euronext Paris" },
                        { label: tForm("identification.description.fields.market.options.LSE"), value: "LSE" },
                        { label: tForm("identification.description.fields.market.options.DAX"), value: "DAX" },
                        { label: tForm("identification.description.fields.market.options.OTHER"), value: "Autre" },],
                }, activitySector:
                    { label: tForm("identification.description.fields.activitySector"), type: "text", },
            },
        },
        {
            title: tForm("settings.title"),
            description: tForm("settings.description"),
            icon: Settings,
            data: {
                isAvailable:
                {
                    label: tForm("settings.description.fields.isAvailable"),
                    type: "switch",
                },
            },
        },];
    return isin ? <EditActionForm 
    isin={isin} 
    sections={sections as Section<UpdateAction>[]} 
    t={tFormUpdate}/> : <CreateActionForm
    sections={sections as Section<NewAction>[]}
    tForm = {tForm}
    t={tFormUpdate}/>;

};
const CreateActionForm = ({ sections, tForm,  t }: { sections: Section<NewAction>[], tForm: ReturnType<typeof useTranslations>, t: ReturnType<typeof useTranslations>; }) => {

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
const EditActionForm = ({ isin, sections, t }: { isin: ActionId, sections: Section<UpdateAction>[], t: ReturnType<typeof useTranslations>;}) => {

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
