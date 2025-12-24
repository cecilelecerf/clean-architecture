"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { endpoints } from "@/utils/endpoint";
import { CreditId } from "@infrastructure/types/credit";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Percent,
    TrendingUp,
    CalendarClock,
    DollarSign,
    FileText,
    User,
    Shield,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { use } from "react";

const statusConfig = {
    PENDING: {
        label: "En attente",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
    },
    ACCEPTED: {
        label: "Accepté",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
    },
    ACCEPTED_FUTURE: {
        label: "Accepté - À venir",
        variant: "secondary" as const,
        icon: CalendarClock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
    },
    REFUSED: {
        label: "Refusé",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
    },
    COMPLETED: {
        label: "Terminé",
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
    },
};

export default function CreditDetailPage({
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
                <h1 className="text-2xl font-bold">Détail du crédit</h1>
            </div>

            {match(query)
                .with({ status: "error" }, () => ("error"
                ))
                .with({ status: "pending" }, () => <CreditDetailSkeleton />)
                .with({ status: "success" }, ({ data: credit }) => {
                    const isFuture = new Date(credit.startDate) > new Date();
                    const config =
                        credit.status === "ACCEPTED" && isFuture
                            ? statusConfig.ACCEPTED_FUTURE
                            : statusConfig[credit.status];
                    const StatusIcon = config.icon;

                    // Calculer la progression
                    const totalAmount = credit.initialAmount.amount;
                    const remainingAmount = credit.remainingBalance.amount;
                    const paidAmount = totalAmount - remainingAmount;
                    const progressPercentage = Math.round((paidAmount / totalAmount) * 100);

                    return (
                        <div className="space-y-6">
                            {/* Card principale - Statut */}
                            <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                                                <h2 className="text-2xl font-bold">
                                                    {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.initialAmount.currency,
                                                    })}
                                                </h2>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Crédit demandé le {formatDateFrench(credit.createdAt)}
                                            </p>
                                        </div>
                                        <Badge variant={config.variant} >
                                            {config.label}
                                        </Badge>
                                    </div>

                                    {/* Messages selon le statut */}
                                    {credit.status === "PENDING" && (
                                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                ⏳ Votre demande est en cours d'examen par nos conseillers.
                                                Vous recevrez une réponse prochainement.
                                            </p>
                                        </div>
                                    )}

                                    {isFuture && credit.status === "ACCEPTED" && (
                                        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                                            <p className="text-sm text-blue-800 font-medium mb-1">
                                                📅 Votre crédit débutera le {formatDateFrench(credit.startDate)}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Les prélèvements automatiques commenceront à cette date.
                                            </p>
                                        </div>
                                    )}

                                    {credit.status === "REFUSED" && (
                                        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                ❌ Votre demande de crédit n'a pas été acceptée.
                                                Contactez votre conseiller pour plus d'informations.
                                            </p>
                                        </div>
                                    )}

                                    {credit.status === "COMPLETED" && (
                                        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                ✅ Félicitations ! Votre crédit est entièrement remboursé.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Progression du remboursement (seulement pour ACCEPTED actif et COMPLETED) */}
                            {(credit.status === "ACCEPTED" && !isFuture) || credit.status === "COMPLETED" ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Progression du remboursement
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">
                                                    {progressPercentage}% remboursé
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {paidAmount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.initialAmount.currency,
                                                    })}{" "}
                                                    / {totalAmount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.initialAmount.currency,
                                                    })}
                                                </span>
                                            </div>
                                            <Progress value={progressPercentage} className="h-3" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Montant payé</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    {paidAmount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.initialAmount.currency,
                                                    })}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Reste à payer</p>
                                                <p className="text-xl font-bold text-orange-600">
                                                    {remainingAmount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.remainingBalance.currency,
                                                    })}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1">Mensualité</p>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                                        style: "currency",
                                                        currency: credit.monthlyPayment.currency,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {/* Détails du crédit */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Caractéristiques du crédit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Montant emprunté</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.initialAmount.currency,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Durée du crédit</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.durationMonths} mois
                                                        ({Math.round(credit.durationMonths / 12)} ans)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'intérêt</p>
                                                    <p className="text-lg font-semibold">{credit.interestRate}%</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'assurance</p>
                                                    <p className="text-lg font-semibold">{credit.insuranceRate}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CalendarClock className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Date de début</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatDateFrench(credit.startDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Mensualité</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.monthlyPayment.currency,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conseiller (si assigné) */}
                            {credit.advisorId && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Votre conseiller
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">
                                            Conseiller assigné : ID {credit.advisorId}
                                        </p>
                                        <Button variant="outline" className="mt-4">
                                            Contacter mon conseiller
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    );
                })
                .exhaustive()}
        </>
    );
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