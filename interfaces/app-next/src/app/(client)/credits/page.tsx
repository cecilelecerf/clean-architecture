"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    Percent,
    TrendingUp,
    Eye,
    CalendarClock
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";

const statusConfig = {
    PENDING: {
        label: "En attente",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
    },
    ACCEPTED: {
        label: "Accepté",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
    },
    ACCEPTED_FUTURE: {
        label: "Accepté - À venir",
        variant: "secondary" as const,
        icon: CalendarClock,
        color: "text-blue-600",
    },
    REFUSED: {
        label: "Refusé",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
    },
    COMPLETED: {
        label: "Terminé",
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-blue-600",
    },
};

export default function ClientCreditsPage() {
    const query = useQuery(endpoints.credits.getAll());
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Mes crédits</h1>
                <p className="text-gray-500">Suivez l'état de vos demandes de crédit</p>
            </div>

            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <CreditsSkeleton />)
                .with({ status: "success" }, ({ data: credits }) => {
                    if (credits.length === 0) {
                        return (
                            <Card className="text-center p-12">
                                <CardContent className="space-y-4">
                                    <AlertCircle className="w-16 h-16 mx-auto text-gray-400" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Aucun crédit</h3>
                                        <p className="text-gray-500 mt-2">
                                            Vous n'avez pas encore de demande de crédit
                                        </p>
                                    </div>
                                    <Button onClick={() => router.push("/credits/new")}>
                                        Faire une demande
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <div className="space-y-8">
                            {/* Crédits acceptés/actifs - Grid de cards */}
                            {credits.some((credit) => credit.status === "ACCEPTED") && (
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Crédits en cours</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {credits
                                            .filter((credit) => credit.status === "ACCEPTED")
                                            .map((credit) => {
                                                // Déterminer si le crédit est futur ou actif
                                                const isFuture = new Date(credit.startDate) > new Date();
                                                const config = isFuture
                                                    ? statusConfig.ACCEPTED_FUTURE
                                                    : statusConfig.ACCEPTED;
                                                const StatusIcon = config.icon;

                                                return (
                                                    <Card
                                                        key={credit.id}
                                                        className="hover:shadow-lg transition-all cursor-pointer"
                                                        onClick={() => router.push(`/credits/${credit.id}`)}
                                                    >
                                                        <CardHeader>
                                                            <div className="flex justify-between items-start">
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                                                    Crédit{" "}
                                                                    {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                                                        style: "currency",
                                                                        currency: credit.initialAmount.currency,
                                                                    })}
                                                                </CardTitle>
                                                                <Badge variant={config.variant}>{config.label}</Badge>
                                                            </div>
                                                        </CardHeader>

                                                        <CardContent className="space-y-4">
                                                            {/* Informations principales */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Durée
                                                                    </p>
                                                                    <p className="font-semibold">{credit.durationMonths} mois</p>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Percent className="w-3 h-3" />
                                                                        Taux d'intérêt
                                                                    </p>
                                                                    <p className="font-semibold">{credit.interestRate}%</p>
                                                                </div>
                                                            </div>

                                                            {/* Mensualité */}
                                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-xs text-gray-500 mb-1">Mensualité</p>
                                                                <p className="text-2xl font-bold">
                                                                    {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                                                        style: "currency",
                                                                        currency: credit.monthlyPayment.currency,
                                                                    })}
                                                                </p>
                                                            </div>

                                                            {/* Affichage différent selon futur/actif */}
                                                            {isFuture ? (
                                                                // CRÉDIT FUTUR - Date de début mise en avant
                                                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <CalendarClock className="w-4 h-4 text-blue-600" />
                                                                        <p className="text-xs text-blue-700 font-medium">
                                                                            Débute le
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-lg font-bold text-blue-700">
                                                                        {formatDateFrench(credit.startDate)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                // CRÉDIT ACTIF - Solde restant
                                                                <div className="flex justify-between items-center pt-2 border-t">
                                                                    <div className="space-y-1">
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <TrendingUp className="w-3 h-3" />
                                                                            Reste à payer
                                                                        </p>
                                                                        <p className="font-semibold">
                                                                            {credit.remainingBalance.amount.toLocaleString("fr-FR", {
                                                                                style: "currency",
                                                                                currency: credit.remainingBalance.currency,
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500">Début</p>
                                                                        <p className="text-sm font-medium">
                                                                            {formatDateFrench(credit.startDate)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                </section>
                            )}

                            {/* Autres crédits - Tableau */}
                            {credits.some((credit) => credit.status !== "ACCEPTED") && (
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Historique des demandes</h2>
                                    <Card>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b">
                                                        <tr>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Statut
                                                            </th>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Montant
                                                            </th>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Durée
                                                            </th>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Taux
                                                            </th>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Mensualité
                                                            </th>
                                                            <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                                                Date
                                                            </th>
                                                            <th className="text-right p-4 text-sm font-semibold text-gray-600">
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {credits
                                                            .filter((credit) => credit.status !== "ACCEPTED")
                                                            .map((credit) => {
                                                                const config = statusConfig[credit.status];
                                                                const StatusIcon = config.icon;

                                                                return (
                                                                    <tr
                                                                        key={credit.id}
                                                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                                        onClick={() => router.push(`/credits/${credit.id}`)}
                                                                    >
                                                                        <td className="p-4">
                                                                            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                                                                                <StatusIcon className="w-3 h-3" />
                                                                                {config.label}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className="p-4 font-semibold">
                                                                            {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                                                                style: "currency",
                                                                                currency: credit.initialAmount.currency,
                                                                            })}
                                                                        </td>
                                                                        <td className="p-4 text-gray-600">
                                                                            {credit.durationMonths} mois
                                                                        </td>
                                                                        <td className="p-4 text-gray-600">{credit.interestRate}%</td>
                                                                        <td className="p-4 font-medium">
                                                                            {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                                                                style: "currency",
                                                                                currency: credit.monthlyPayment.currency,
                                                                            })}
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-500">
                                                                            {credit.status === "PENDING"
                                                                                ? formatDateFrench(credit.createdAt)
                                                                                : formatDateFrench(credit.updatedAt)}
                                                                        </td>
                                                                        <td className="text-right">
                                                                            <Button
                                                                                variant="link"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    router.push(`/credits/${credit.id}`);
                                                                                }}
                                                                            >
                                                                                <Eye className="w-4 h-4 mr-1" /> Détails
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            )}
                        </div>
                    );
                })
                .exhaustive()}
        </div>
    );
}

const CreditsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-28" />
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);