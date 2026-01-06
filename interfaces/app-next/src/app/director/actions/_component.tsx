
"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Building2,
    DollarSign,
    FileText,
    Settings,
} from "lucide-react";
import { ActionId } from "@infrastructure/types/action";
import FormWrapper, { FormSection } from "@/components/FromWrapper";

const actionSchema = {
    name: { min: 2, max: 100 },
    symbol: { min: 1, max: 10 },
    totalNb: { min: 1 },
    price: { min: 0.01 },
};

export const ActionForm = ({ isin }: { isin?: ActionId }) => {
    const router = useRouter();
    const isEditMode = !!isin;

    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        market: "",
        activitySector: "",
        quantity: 0,
        price: { amount: 0, currency: "EUR" },
        isAvailable: "true",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"error" | "success">("error");

    const query = useQuery({
        ...endpoints.actions.get({ isin: isin! }),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (isEditMode && query.status === "success" && query.data) {
            const action = query.data;
            setFormData({
                name: action.name,
                symbol: action.symbol,
                market: action.market,
                activitySector: action.activitySector,
                price: { amount: action.price.amount, currency: action.price.currency, },
                isAvailable: action.isAvailable ? "true" : "false",
                quantity: 0
            });
        }
    }, [isEditMode, query.status, query.data]);

    const createMutation = useMutation(endpoints.actions.create());

    const updateMutation = useMutation(endpoints.actions.update({ actionIsin: isin }));

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.name.length < actionSchema.name.min) {
            newErrors.name = `Le nom doit faire au moins ${actionSchema.name.min} caractères`;
        }

        if (formData.symbol.length < actionSchema.symbol.min) {
            newErrors.symbol = "Le symbole est requis";
        }

        if (!formData.market) {
            newErrors.market = "Le marché est requis";
        }

        if (!formData.activitySector) {
            newErrors.activitySector = "Le secteur d'activité est requis";
        }

        const totalNb = formData.quantity
        if (isNaN(totalNb) || totalNb < actionSchema.totalNb.min) {
            newErrors.totalNb = "Le nombre d'actions doit être un entier positif";
        }

        const price = formData.price.amount
        if (isNaN(price) || price < actionSchema.price.min) {
            newErrors.price = "Le prix doit être un nombre positif";
        }
        console.log(newErrors)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        console.log(validateForm)

        if (!validateForm()) {
            console.log(errors)
            setMessage("Veuillez corriger les erreurs dans le formulaire");
            setMessageType("error");
            return;
        }

        if (isEditMode) {
            updateMutation.mutate({ payload: { ...formData, isAvailable: formData.isAvailable === "true" } }, {
                onSuccess: () => {
                    toast.success("Action mise à jour avec succès");
                    router.push(`/director/actions/${isin}`);
                },
                onError: (error: Error) => {
                    setMessage(error.message);
                    setMessageType("error");
                    toast.error("Erreur lors de la mise à jour");
                },
            });
        } else {
            createMutation.mutate({ payload: { ...formData, isAvailable: formData.isAvailable === "true" } }, {
                onSuccess: (data) => {
                    toast.success("Action créée avec succès");
                    router.push(`/director/actions/${data.ISIN}`);
                },
                onError: (error: Error) => {
                    setMessage(error.message);
                    setMessageType("error");
                    toast.error("Erreur lors de la création");
                },
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const sections: FormSection[] = [
        {
            title: "Identification",
            description: "Informations de base sur l'action",
            icon: FileText,
            fields: [
                {
                    label: "Symbole",
                    type: "text",
                    placeholder: "AAPL",
                    get: formData.symbol,
                    set: (value) => setFormData({ ...formData, symbol: value as string }),
                    required: true,
                    description: errors.symbol || "Symbole boursier (1-10 caractères)",
                },
                {
                    label: "Nom de l'action",
                    type: "text",
                    placeholder: "Apple Inc.",
                    get: formData.name,
                    set: (value) => setFormData({ ...formData, name: value as string }),
                    required: true,
                    description: errors.name || "Nom complet de l'entreprise",
                },
            ],
        },
        {
            title: "Marché & Secteur",
            description: "Classification de l'action",
            icon: Building2,
            fields: [
                {
                    label: "Marché",
                    type: "select",
                    placeholder: "Sélectionnez un marché",
                    get: formData.market,
                    set: (value) => setFormData({ ...formData, market: value as string }),
                    required: true,
                    options: [
                        { label: "NASDAQ", value: "NASDAQ" },
                        { label: "NYSE", value: "NYSE" },
                        { label: "Euronext Paris", value: "Euronext Paris" },
                        { label: "LSE", value: "LSE" },
                        { label: "DAX", value: "DAX" },
                        { label: "Autre", value: "Autre" },
                    ],
                    description: errors.market || "Marché sur lequel l'action est cotée",
                },
                {
                    label: "Secteur d'activité",
                    type: "creatable-select",
                    placeholder: "Technologie",
                    get: formData.activitySector,
                    set: (value) =>
                        setFormData({ ...formData, activitySector: value as string }),
                    required: true,
                    options: [
                        { label: "Technologie", value: "Technologie" },
                        { label: "Finance", value: "Finance" },
                        { label: "Santé", value: "Santé" },
                        { label: "Énergie", value: "Énergie" },
                        { label: "Industrie", value: "Industrie" },
                        { label: "Consommation", value: "Consommation" },
                        { label: "Télécommunications", value: "Télécommunications" },
                        { label: "Services publics", value: "Services publics" },
                        { label: "Immobilier", value: "Immobilier" },
                    ],
                    description: errors.activitySector || "Secteur d'activité principal",
                },
            ],
        },
        ...(!isEditMode ? [{
            title: "Valeur initiale",
            description: "Informations financières de départ",
            icon: DollarSign,
            fields: [
                {
                    label: "Nombre total d'actions",
                    type: "number" as const,
                    placeholder: "1000000",
                    get: formData.quantity,
                    set: (value: string | string[]) =>
                        setFormData({ ...formData, quantity: Array.isArray(value) ? Number(value[0]) : Number(value) }),
                    required: true,
                    numberOptions: { min: 1, step: 1 },
                    description: errors.quantity || "Nombre total d'actions disponibles",
                },
                {
                    label: "Prix initial",
                    type: "number" as const,
                    placeholder: "150.00",
                    get: formData.price.amount,
                    set: (value: string | string[]) =>
                        setFormData({
                            ...formData,
                            price: {
                                ...formData.price,
                                amount: Array.isArray(value) ? Number(value[0]) : Number(value)
                            }
                        }),
                    required: true,
                    numberOptions: { min: 0.01, step: 0.01 },
                    description: errors.currentPrice || "Prix unitaire initial de l'action",
                },
                {
                    label: "Devise",
                    type: "select" as const,
                    get: formData.price.currency,
                    set: (value: string | string[]) =>
                        setFormData({
                            ...formData,
                            price: {
                                ...formData.price,
                                currency: Array.isArray(value) ? value[0] : value,
                            }
                        }),
                    required: true,
                    options: [
                        { label: "EUR (€)", value: "EUR" },
                        { label: "USD ($)", value: "USD" },
                        { label: "GBP (£)", value: "GBP" },
                    ],
                },
            ],
        }] : []),
        {
            title: "Paramètres",
            description: "Configuration de disponibilité",
            icon: Settings,
            fields: [
                {
                    label: "Disponibilité",
                    type: "radio",
                    get: formData.isAvailable,
                    set: (value) =>
                        setFormData({ ...formData, isAvailable: value as string }),
                    required: true,
                    options: [
                        { label: "Disponible à la vente", value: "true" },
                        { label: "Indisponible", value: "false" },
                    ],
                    description: "L'action peut-elle être achetée par les clients ?",
                },
            ],
        },
    ];

    if (isEditMode && query.status === "pending") {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded animate-pulse" />
                        <div className="h-96 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <FormWrapper
                    title={isEditMode ? "Modifier l'action" : "Nouvelle action"}
                    description={
                        isEditMode
                            ? "Modifiez les informations de l'action boursière"
                            : "Créez une nouvelle action boursière dans le système"
                    }
                    sections={sections}
                    button={isEditMode ? "Mettre à jour" : "Créer l'action"}
                    loading={isLoading}
                    message={message}
                    messageType={messageType}
                    onSubmit={handleSubmit}
                    showBackButton={true}
                />
            </div>
        </div>
    );
}