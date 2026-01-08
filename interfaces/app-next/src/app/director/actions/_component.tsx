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

export const ActionForm = ({ isin }: { isin?: ActionId }) => {
    const sections = [
        {
            title: "Identification",
            description: "Informations de base sur l'action",
            icon: FileText,
            data: {
                symbol: { label: "Symbole", type: "text" },
                name: { label: "Nom de l'action", type: "text" },
            },
        },
        {
            title: "Marché & Secteur",
            description: "Classification de l'action",
            icon: Building2,
            data: {
                market: {
                    label: "Marché", type: "radio",
                    options:
                        [{ label: "NASDAQ", value: "NASDAQ" },
                        { label: "NYSE", value: "NYSE" },
                        { label: "Euronext Paris", value: "Euronext Paris" },
                        { label: "LSE", value: "LSE" },
                        { label: "DAX", value: "DAX" },
                        { label: "Autre", value: "Autre" },],
                }, activitySector:
                    { label: "Secteur d'activité", type: "text", },
            },
        },
        {
            title: "Paramètres",
            description: "Configuration de disponibilité",
            icon: Settings,
            data: {
                isAvailable:
                {
                    label: "Disponibilité",
                    type: "switch",
                },
            },
        },];
    return isin ? <EditActionForm isin={isin} sections={sections as Section<UpdateAction>[]} /> : <CreateActionForm sections={sections as Section<NewAction>[]} />;

};
const CreateActionForm = ({ sections }: { sections: Section<NewAction>[] }) => {

    const form = useForm<NewAction>({
        resolver: zodResolver(newActionSchema),
        mode: "onChange",
    });
    const currenciesQuery = useQuery(endpoints.currencies.getAll());

    const updateSection = [{
        title: "Valeur initiale",
        description: "Informations financières de départ",
        icon: DollarSign,
        data: {
            quantity: { label: "Nombre total d'actions", type: "number" },
            priceAmount: { label: "Prix initial", type: "number" },
            priceCurrency: {
                label: "Devise", type: "select",
                options:
                    currenciesQuery.status === "success" ?
                        currenciesQuery.data.map((d) => ({ label: ` ${d.code} - ${d.name}(${d.symbol})`, value: d.code, })) : [],
            },
        },
    }]
    const createMutation = useMutation(endpoints.actions.create());
    return (
        <FormWrapper<NewAction>
            title="Nouvelle action"
            form={form}
            data={[...updateSection, ...sections,] as Section<UpdateAction>[]}
            labelButton="Créer une nouvelle action"
            loading={createMutation.isPending}
            onSubmit={(values) => createMutation.mutate({ payload: values })}
        />
    );
};
const EditActionForm = ({ isin, sections }: { isin: ActionId, sections: Section<UpdateAction>[] }) => {

    const form = useForm<z.infer<typeof updateActionSchema>>({
        resolver: zodResolver(updateActionSchema),
    });

    const updateMutation = useMutation(
        endpoints.actions.update({ actionIsin: isin })
    );

    return (
        <FormWrapper<UpdateAction>
            title="Modifier l'action"
            form={form}
            labelButton="Modifier"
            loading={updateMutation.isPending}
            data={sections}
            onSubmit={(values) => updateMutation.mutate({ payload: values })}
        />
    );
};
