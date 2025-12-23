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
    TrendingUp
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
                .with({ status: "error" }, () => (
                    <div className="text-red-500 text-center border border-red-200 p-6 rounded-lg">
                        Erreur lors du chargement des crédits
                    </div>
                ))
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
                                    <Button onClick={() => router.push("/client/credits/new")}>
                                        Faire une demande
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {credits.map((credit) => {
                                const config = statusConfig[credit.status];
                                const StatusIcon = config.icon;

                                return (
                                    <Card
                                        key={credit.id}
                                        className="hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => router.push(`/client/credits/${credit.id}`)}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="flex items-center gap-2">
                                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                                    Crédit {credit.initialAmount.amount.toLocaleString("fr-FR", {
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

                                            {/* Solde restant (si accepté ou en cours) */}
                                            {(credit.status === "ACCEPTED" || credit.status === "COMPLETED") && (
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

                                            {/* Date de demande */}
                                            {credit.status === "PENDING" && (
                                                <div className="text-xs text-gray-500 pt-2 border-t">
                                                    {/* Demande créée le {formatDateFrench(credit)} */}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
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