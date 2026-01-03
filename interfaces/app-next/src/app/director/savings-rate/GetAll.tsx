"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateFrench } from "@/utils/date/formatDateFrench"
import { endpoints } from "@/utils/endpoint"
import { SavingRate, SavingRateId } from "@infrastructure/types/savingsrate"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Clock, History, Percent, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { match } from "ts-pattern"

export const GetAllSavingsRate = ({ current }: { current: SavingRate | null }) => {
    const query = useQuery(endpoints.savingsRates.getAll())

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => new Array(5).map((i) => <SavingsRatesSkeleton key={i} />))
        .with({ status: "success" }, ({ data: rates }) => {
            if (rates.length === 0) {
                return (
                    <Card className="text-center p-12">
                        <CardContent>
                            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">
                                Aucun taux d'épargne configuré
                            </p>
                            <Link href="/director/savings-rate/new">
                                <Button >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Créer un taux
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            }

            return (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Historique des taux ({rates.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rates.filter((rate) => rate.id !== current.id).map((rate) => (
                            <SavingsRateCard
                                key={rate.id}
                                rate={rate}
                            />
                        ))}
                    </div>
                </div>

            );

        })
        .exhaustive()
}


const SavingsRateCard = ({
    rate,
}: {
    rate: SavingRate;
}) => {
    const effectiveDate = new Date(rate.effectiveDate);
    const now = new Date();
    const isFuture = effectiveDate > now;
    const getBadge = () => {
        if (isFuture) {
            return (
                <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    À venir
                </Badge>
            );
        } else
            return (
                <Badge variant="outline">
                    <History className="w-3 h-3 mr-1" />
                    Historique
                </Badge>
            );
    };


    return (
        <Card className={`hover:shadow-md hover:scale-105 transition-all`}>
            <CardContent className="space-y-4">
                {/* Header avec badge */}
                {getBadge()}

                {/* Taux principal */}
                <div className="flex items-center gap-3">
                    <Percent className={`w-8 h-8 "text-gray-400`} />
                    <div>
                        <p className={`text-4xl font-bold text-gray-700`}>
                            {rate.rate}%
                        </p>
                        <p className="text-sm text-gray-500">par an</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                            <span className="font-medium">Effectif le :</span>{" "}
                            {formatDateFrench(rate.effectiveDate)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Créé le {formatDateFrench(rate.createdAt)}
                    </div>
                </div>

                {/* Message contextuel */}
                {isFuture && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Ce taux sera appliqué dans{" "}
                        {Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        jour(s)
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export const SavingsRatesSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <div className="flex gap-1">
                                <Skeleton className="h-8 w-8 rounded" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                        <div className="space-y-2 pt-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);