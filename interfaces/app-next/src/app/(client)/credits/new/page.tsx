"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import FormWrapper, { Field } from "@/components/FromWrapper";

export default function NewCreditPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [interestRate, setInterestRate] = useState("3.5");
    const [insuranceRate, setInsuranceRate] = useState("0.3");
    const [currency] = useState("EUR");

    const calculateDurationMonths = () => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const months = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        return months;
    };

    const durationMonths = calculateDurationMonths();

    const mutation = useMutation(endpoints.credits.create());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (durationMonths <= 0) {
            return;
        }

        mutation.mutate({
            amount: parseFloat(amount),
            durationMonths,
            interestRate: parseFloat(interestRate),
            insuranceRate: parseFloat(insuranceRate),
            currency,
            startDate,
        }, {
            onSuccess: (data) => {
                router.push(`/credits/${data.id}`);
            },
        });
    };

    // Validation des dates
    const getMinEndDate = () => {
        if (!startDate) return "";
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + 1);
        return start.toISOString().split("T")[0];
    };

    const getMinStartDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const fields: Field[] = [
        {
            label: "Montant souhaité",
            type: "number",
            placeholder: "Ex: 10000",
            get: amount,
            set: (value) => setAmount(value as string),
            numberOptions: {
                min: 1000,
                max: 500000,
                step: 100,
            },
        },
        {
            label: "Date de début du crédit",
            type: "date",
            placeholder: "",
            get: startDate,
            set: (value) => {
                setStartDate(value as string);
                // Réinitialiser endDate si elle est avant la nouvelle startDate
                if (endDate && new Date(endDate) <= new Date(value as string)) {
                    setEndDate("");
                }
            },
            numberOptions: {
                min: getMinStartDate(),
            },
        },
        {
            label: "Date de fin du crédit",
            type: "date",
            placeholder: "",
            get: endDate,
            set: (value) => setEndDate(value as string),
            disabled: !startDate,
            numberOptions: {
                min: getMinEndDate(),
            },
        },
        {
            label: "Taux d'intérêt (%)",
            type: "number",
            placeholder: "Ex: 3.5",
            get: interestRate,
            set: (value) => setInterestRate(value as string),
            numberOptions: {
                min: 0.1,
                max: 20,
                step: 0.1,
            },
        },
        {
            label: "Taux d'assurance (%)",
            type: "number",
            placeholder: "Ex: 0.3",
            get: insuranceRate,
            set: (value) => setInsuranceRate(value as string),
            numberOptions: {
                min: 0,
                max: 5,
                step: 0.05,
            },
        },
    ];

    // Calcul de la mensualité approximative
    const calculateMonthlyPayment = () => {
        if (!amount || durationMonths <= 0 || !interestRate) return 0;

        const principal = parseFloat(amount);
        const months = durationMonths;
        const monthlyRate = parseFloat(interestRate) / 100 / 12;
        const insurance = parseFloat(insuranceRate) / 100 / 12;

        if (monthlyRate === 0) {
            return principal / months;
        }

        const monthlyPayment =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

        return monthlyPayment + principal * insurance;
    };

    const monthlyPayment = calculateMonthlyPayment();
    const totalCost = monthlyPayment * durationMonths;
    const totalInterest = totalCost - parseFloat(amount || "0");

    // Calculer la durée en années et mois
    const getDurationText = () => {
        if (durationMonths === 0) return "";
        const years = Math.floor(durationMonths / 12);
        const months = durationMonths % 12;

        if (years === 0) return `${months} mois`;
        if (months === 0) return `${years} an${years > 1 ? 's' : ''}`;
        return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <FormWrapper
                title="Nouvelle demande de crédit"
                description="Remplissez le formulaire pour soumettre votre demande de crédit. Un conseiller l'examinera prochainement."
                fields={fields}
                button="Soumettre la demande"
                loading={mutation.isPending}
                message={
                    mutation.isError
                        ? "Erreur lors de la soumission de votre demande"
                        : durationMonths <= 0 && startDate && endDate
                            ? "La date de fin doit être après la date de début"
                            : undefined
                }
                messageType={mutation.isError || (durationMonths <= 0 && startDate && endDate) ? "error" : undefined}
            >
                {/* Durée calculée */}
                {durationMonths > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-700">Durée du crédit :</span>
                            <span className="font-semibold text-blue-900">
                                {getDurationText()} ({durationMonths} mois)
                            </span>
                        </div>
                    </div>
                )}

                {/* Simulation du crédit */}
                {amount && durationMonths > 0 && monthlyPayment > 0 && (
                    <div className="mt-6 p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                        <h3 className="text-lg font-semibold mb-4 text-blue-900">
                            Simulation de votre crédit
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Mensualité :</span>
                                <span className="text-2xl font-bold text-blue-700">
                                    {monthlyPayment.toLocaleString("fr-FR", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Coût total du crédit :</span>
                                <span className="font-semibold text-gray-800">
                                    {totalCost.toLocaleString("fr-FR", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Dont intérêts :</span>
                                <span className="font-semibold text-gray-800">
                                    {totalInterest.toLocaleString("fr-FR", {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-blue-300">
                                <p className="text-xs text-blue-800">
                                    💡 Cette simulation est indicative. Le montant définitif sera calculé après
                                    validation de votre dossier.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </FormWrapper>
        </form>
    );
}