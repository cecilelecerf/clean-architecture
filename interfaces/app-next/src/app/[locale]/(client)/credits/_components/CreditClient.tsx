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
    AlertCircle,
    Calendar,
    TrendingUp,
    CalendarClock
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { CreditArray } from "@/components/credits/CreditArray";
import { statusConfig } from "@/components/credits/constant";


export const ClientCredits = () => {
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
                                    <Button onClick={() => router.push("/credits/formules")}>
                                        Voir les formules de crédits
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <div className="space-y-8">
                            {credits.some((credit) => credit.status === "ACCEPTED") && (
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Crédits en cours</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {credits
                                            .filter((credit) => credit.status === "ACCEPTED")
                                            .map((credit) => {
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
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Durée
                                                                    </p>
                                                                    <p className="font-semibold">{credit.durationMonths} mois</p>
                                                                </div>
                                                            </div>

                                                            <div className="p-3 bg-gray-50 dark:bg-gray-50/10 rounded-lg">
                                                                <p className="text-xs text-gray-500 mb-1">Mensualité</p>
                                                                <p className="text-2xl font-bold">
                                                                    {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                                                        style: "currency",
                                                                        currency: credit.monthlyPayment.currency,
                                                                    })}
                                                                </p>
                                                            </div>

                                                            {isFuture ? (
                                                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg  ">
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
                                <CreditArray title="Autres demande" credits={credits
                                    .filter((credit) => credit.status !== "ACCEPTED")} basePath="" />
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