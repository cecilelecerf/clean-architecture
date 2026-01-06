"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FormuleId } from "@infrastructure/types/formule";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calculator,
    TrendingUp,
    Calendar,
    Euro,
    Percent,
    Shield,
    ArrowRight,
    FileText,
    AlertCircle,
} from "lucide-react";

interface SimulationResult {
    initialAmount: number;
    durationMonths: number;
    monthlyPayment: number;
    totalInterest: number;
    totalInsurance: number;
    totalCost: number;
    totalRepayment: number;
    effectiveRate: number;
    schedule: PaymentScheduleItem[];
}

interface PaymentScheduleItem {
    month: number;
    principal: number;
    interest: number;
    insurance: number;
    total: number;
    remainingBalance: number;
}

export default function SimulateCreditPage() {
    const { formuleId } = useParams<{ formuleId: FormuleId }>();
    const router = useRouter();
    const query = useQuery(endpoints.formules.get({ formuleId }));

    const [amount, setAmount] = useState(10000);
    const [duration, setDuration] = useState(24);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);

    const handleSimulate = (formule: any) => {
        const monthlyInterestRate = formule.interestRate / 100 / 12;
        const monthlyInsuranceRate = formule.insuranceRate / 100 / 12;

        const monthlyPaymentPrincipal =
            (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration)) /
            (Math.pow(1 + monthlyInterestRate, duration) - 1);

        const monthlyInsurance = amount * monthlyInsuranceRate;
        const monthlyPayment = monthlyPaymentPrincipal + monthlyInsurance;

        const schedule: PaymentScheduleItem[] = [];
        let remainingBalance = amount;

        for (let month = 1; month <= duration; month++) {
            const interestPayment = remainingBalance * monthlyInterestRate;
            const principalPayment = monthlyPaymentPrincipal - interestPayment;
            remainingBalance -= principalPayment;

            schedule.push({
                month,
                principal: principalPayment,
                interest: interestPayment,
                insurance: monthlyInsurance,
                total: monthlyPayment,
                remainingBalance: Math.max(0, remainingBalance),
            });
        }

        const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
        const totalInsurance = schedule.reduce((sum, item) => sum + item.insurance, 0);
        const totalRepayment = monthlyPayment * duration;
        const totalCost = totalInterest + totalInsurance;

        const effectiveRate = ((totalRepayment - amount) / amount / (duration / 12)) * 100;

        setSimulation({
            initialAmount: amount,
            durationMonths: duration,
            monthlyPayment,
            totalInterest,
            totalInsurance,
            totalCost,
            totalRepayment,
            effectiveRate,
            schedule,
        });
    };

    return match(query)
        .with({ status: "pending" }, () => <SimulationPageSkeleton />)
        .with({ status: "error" }, () => (
            <div className="container mx-auto py-8 px-4">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <p className="text-red-600 font-semibold">
                            Impossible de charger la formule
                        </p>
                    </CardContent>
                </Card>
            </div>
        ))
        .with({ status: "success" }, ({ data: formule }) => {
            if (!formule) return null;

            return (
                <div className="container mx-auto py-8 px-4 max-w-7xl">
                    <div className="space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Simulateur de crédit
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Formule : <span className="font-semibold">{formule.label}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Formulaire de simulation */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-8">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calculator className="w-5 h-5" />
                                            Paramètres
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Montant */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="amount">Montant du crédit</Label>
                                                <Badge variant="outline">
                                                    {amount.toLocaleString('fr-FR')} €
                                                </Badge>
                                            </div>
                                            <Slider
                                                id="amount"
                                                min={formule.minAmount || 1000}
                                                max={formule.maxAmount || 100000}
                                                step={1000}
                                                value={[amount]}
                                                onValueChange={([value]) => setAmount(value)}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{(formule.minAmount || 1000).toLocaleString('fr-FR')} €</span>
                                                <span>{(formule.maxAmount || 100000).toLocaleString('fr-FR')} €</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Durée */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="duration">Durée</Label>
                                                <Badge variant="outline">
                                                    {duration} mois ({(duration / 12).toFixed(1)} ans)
                                                </Badge>
                                            </div>
                                            <Slider
                                                id="duration"
                                                min={12}
                                                max={120}
                                                step={6}
                                                value={[duration]}
                                                onValueChange={([value]) => setDuration(value)}
                                                className="py-4"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>12 mois</span>
                                                <span>120 mois</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Taux */}
                                        <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-900 flex items-center gap-2">
                                                    <Percent className="w-4 h-4" />
                                                    Taux d'intérêt
                                                </span>
                                                <span className="font-bold text-blue-900">
                                                    {formule.interestRate}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-900 flex items-center gap-2">
                                                    <Shield className="w-4 h-4" />
                                                    Taux d'assurance
                                                </span>
                                                <span className="font-bold text-blue-900">
                                                    {formule.insuranceRate}%
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                                            size="lg"
                                            onClick={() => handleSimulate(formule)}
                                        >
                                            <Calculator className="w-5 h-5 mr-2" />
                                            Calculer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Résultats */}
                            <div className="lg:col-span-2">
                                {simulation ? (
                                    <SimulationResults
                                        simulation={simulation}
                                        formule={formule}
                                        onRequestCredit={() => router.push(`/credits/request/${formule.id}`)}
                                    />
                                ) : (
                                    <Card className="h-full flex items-center justify-center p-12">
                                        <div className="text-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                <Calculator className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500">
                                                Ajustez les paramètres et cliquez sur "Calculer" pour voir les résultats
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })
        .exhaustive();
}

interface SimulationResultsProps {
    simulation: SimulationResult;
    formule: any;
    onRequestCredit: () => void;
}

function SimulationResults({ simulation, formule, onRequestCredit }: SimulationResultsProps) {
    const [showFullSchedule, setShowFullSchedule] = useState(false);

    return (
        <div className="space-y-6">
            {/* Mensualité principale */}
            <Card className=" bg-linear-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-blue-900 font-medium uppercase tracking-wide">
                            Votre mensualité
                        </p>
                        <p className="text-5xl font-bold text-blue-900">
                            {simulation.monthlyPayment.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })} €
                        </p>
                        <p className="text-sm text-blue-700">
                            pendant {simulation.durationMonths} mois
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Résumé des coûts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Détail des coûts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CostItem
                            label="Montant emprunté"
                            value={simulation.initialAmount}
                            color="gray"
                        />
                        <CostItem
                            label="Intérêts totaux"
                            value={simulation.totalInterest}
                            color="orange"
                        />
                        <CostItem
                            label="Assurance totale"
                            value={simulation.totalInsurance}
                            color="purple"
                        />
                        <CostItem
                            label="Coût total du crédit"
                            value={simulation.totalCost}
                            color="red"
                            highlighted
                        />
                    </div>

                    <Separator />

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                Montant total à rembourser
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                                {simulation.totalRepayment.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Taux effectif global (TEG)
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                                {simulation.effectiveRate.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Graphique de répartition */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Euro className="w-5 h-5" />
                        Répartition du coût
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CostBreakdownChart
                        principal={simulation.initialAmount}
                        interest={simulation.totalInterest}
                        insurance={simulation.totalInsurance}
                    />
                </CardContent>
            </Card>

            {/* Tableau d'amortissement */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Tableau d'amortissement
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullSchedule(!showFullSchedule)}
                    >
                        {showFullSchedule ? "Réduire" : "Afficher tout"}
                    </Button>
                </CardHeader>
                <CardContent>
                    <AmortizationTable
                        schedule={simulation.schedule}
                        showAll={showFullSchedule}
                    />
                </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-green-900 text-lg">
                                Cette simulation vous convient ?
                            </h3>
                            <p className="text-sm text-green-700">
                                Transformez votre simulation en demande de crédit officielle
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={onRequestCredit}
                        >
                            <FileText className="w-5 h-5 mr-2" />
                            Faire une demande
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Avertissement */}
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <p className="font-semibold mb-1">Information importante</p>
                            <p>
                                Cette simulation est donnée à titre indicatif. Les montants définitifs
                                seront calculés lors de l'étude de votre dossier et peuvent varier en
                                fonction de votre situation personnelle.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function CostItem({
    label,
    value,
    color,
    highlighted = false,
}: {
    label: string;
    value: number;
    color: "gray" | "orange" | "purple" | "red";
    highlighted?: boolean;
}) {
    const colorClasses = {
        gray: "bg-gray-50 text-gray-900",
        orange: "bg-orange-50 text-orange-900",
        purple: "bg-purple-50 text-purple-900",
        red: "bg-red-50 text-red-900",
    };

    return (
        <div
            className={`p-4 rounded-lg ${colorClasses[color]} ${highlighted ? "ring-2 ring-red-300" : ""
                }`}
        >
            <p className="text-sm font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold">
                {value.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })} €
            </p>
        </div>
    );
}

function CostBreakdownChart({
    principal,
    interest,
    insurance,
}: {
    principal: number;
    interest: number;
    insurance: number;
}) {
    const total = principal + interest + insurance;
    const principalPercent = (principal / total) * 100;
    const interestPercent = (interest / total) * 100;
    const insurancePercent = (insurance / total) * 100;

    return (
        <div className="space-y-4">
            {/* Barre de progression */}
            <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                    className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${principalPercent}%` }}
                >
                    {principalPercent > 15 && `${principalPercent.toFixed(0)}%`}
                </div>
                <div
                    className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${interestPercent}%` }}
                >
                    {interestPercent > 15 && `${interestPercent.toFixed(0)}%`}
                </div>
                <div
                    className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${insurancePercent}%` }}
                >
                    {insurancePercent > 15 && `${insurancePercent.toFixed(0)}%`}
                </div>
            </div>

            {/* Légende */}
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <div>
                        <p className="font-medium">Capital</p>
                        <p className="text-gray-600">
                            {principal.toLocaleString('fr-FR')} €
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <div>
                        <p className="font-medium">Intérêts</p>
                        <p className="text-gray-600">
                            {interest.toLocaleString('fr-FR')} €
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded" />
                    <div>
                        <p className="font-medium">Assurance</p>
                        <p className="text-gray-600">
                            {insurance.toLocaleString('fr-FR')} €
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AmortizationTable({
    schedule,
    showAll,
}: {
    schedule: PaymentScheduleItem[];
    showAll: boolean;
}) {
    const displaySchedule = showAll ? schedule : schedule.slice(0, 12);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr className="border-b">
                        <th className="px-4 py-3 text-left font-semibold">Mois</th>
                        <th className="px-4 py-3 text-right font-semibold">Capital</th>
                        <th className="px-4 py-3 text-right font-semibold">Intérêts</th>
                        <th className="px-4 py-3 text-right font-semibold">Assurance</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-right font-semibold">Restant dû</th>
                    </tr>
                </thead>
                <tbody>
                    {displaySchedule.map((item) => (
                        <tr
                            key={item.month}
                            className="border-b hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-4 py-3 font-medium">{item.month}</td>
                            <td className="px-4 py-3 text-right">
                                {item.principal.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </td>
                            <td className="px-4 py-3 text-right text-orange-600">
                                {item.interest.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </td>
                            <td className="px-4 py-3 text-right text-purple-600">
                                {item.insurance.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                                {item.total.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">
                                {item.remainingBalance.toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} €
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!showAll && schedule.length > 12 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                    ... et {schedule.length - 12} autres mensualités
                </p>
            )}
        </div>
    );
}

function SimulationPageSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="space-y-8">
                <Skeleton className="h-12 w-96" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-[600px]" />
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </div>
        </div>
    );
}