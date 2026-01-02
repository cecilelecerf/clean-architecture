"use client";

import { endpoints } from "@/utils/endpoint";
import { CreditId } from "@infrastructure/types/credit";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    X
} from "lucide-react";
import { match } from "ts-pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCreditMonths, isMonthPaid, formatMonthYear } from "@/utils/credit/credit";
import { Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function CreditMobthlyPage({
    params,
}: {
    params: Promise<{ creditId: CreditId }>;
}) {
    const { creditId } = use(params);
    const router = useRouter();
    const query = useQuery(endpoints.credits.get({ creditId }));

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Détail du mensualités</h1>
            </div>

            {match(query)
                .with({ status: "error" }, () => ("error"
                ))
                .with({ status: "pending" }, () => <CreditDetailSkeleton />)
                .with({ status: "success" }, ({ data: credit }) => {
                    const months = getCreditMonths(
                        credit.startDate,
                        credit.durationMonths
                    );
                    return (
                        <Card>
                        <CardHeader>
                            <CardTitle>Échéancier</CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Mois</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Montant</th>
                                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Statut</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y">
                                        {months.map((monthDate, index) => {
                                        const paid = isMonthPaid(
                                            monthDate,
                                            credit.transactions
                                        );

                                        return (
                                            <tr className={`transition-colors ${
                                                paid
                                                ? "bg-green-50 text-green-900"
                                                : "hover:bg-gray-50"
                                            }`} key={index}>
                                                <td className="p-4 font-semibold">{index + 1}</td>
                                                <td className="p-4 text-sm text-gray-500">{formatMonthYear(monthDate)}
    </td>
                                                <td className="p-4 text-sm text-gray-500">{credit.monthlyPayment.amount} €</td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    <Badge
                                                        variant={paid ? "secondary" : "destructive"}
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {paid ? (
                                                        <Check className="w-3 h-3" />
                                                        ) : (
                                                        <X className="w-3 h-3" />
                                                        )}
                                                        {paid ? "Payé" : "Non payé"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        </Card>
                    );
                    console.log(months);
                    console.log('credit', credit)
                })
                .exhaustive()}
        </>
    )
}

const CreditDetailSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-8 w-40" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);