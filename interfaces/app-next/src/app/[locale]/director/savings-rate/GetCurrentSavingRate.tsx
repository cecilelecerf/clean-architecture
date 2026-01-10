"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UseQueryResult } from "@tanstack/react-query";
import { match } from "ts-pattern";
import {
    CheckCircle,
    Calendar,
    Sparkles,
    Settings,
    Plus,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useRouter } from "next/navigation";
import { SavingRate } from "@infrastructure/types/savingsrate";
import { useTranslations } from "next-intl";

export function AdminSavingsRateHeroBanner({ query }: {
    query: UseQueryResult<SavingRate, Error>
}) {
    const router = useRouter();
    const t = useTranslations("director.saving.current");

    return match(query)
        .with({ status: "pending" }, () => <AdminHeroBannerSkeleton />)
        .with({ status: "error" }, () => (
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500 via-red-600 to-rose-700 p-8 md:p-12">
                <div className="relative text-white text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                        <Settings className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">{t("nothingTitle")}</h2>
                    <p className="text-white/80">
                        {t("nothingText")}
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-red-700 hover:bg-white/90 font-semibold"
                        onClick={() => router.push("/admin/savings-rates")}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t("configure")}
                    </Button>
                </div>
            </div>
        ))
        .with({ status: "success" }, ({ data: currentRate }) => {
            if (!currentRate) {
                return (
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-500 via-orange-600 to-red-700 p-8 md:p-12">
                        <div className="relative text-white text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                                <Settings className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold">{t("noEffectTitle")}</h2>
                            <p className="text-white/80">
                                {t("noEffectText")}
                            </p>
                            <Button
                                size="lg"
                                className="bg-white text-orange-700 hover:bg-white/90 font-semibold"
                                onClick={() => router.push("/admin/savings-rates")}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {t("add")}
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-rose-700 via-red to-pink-900 mb-10">
                    {/* Motif de fond animé */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
                        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse delay-1000" />
                    </div>

                    {/* Contenu */}
                    <div className="relative px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
                            {/* Gauche : Taux principal */}
                            <div className="space-y-6">
                                {/* Badge*/}

                                <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5 w-fit">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t("effectTitle")}
                                </Badge>


                                {/* Taux */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-pulse" />
                                        <div>
                                            <div className="flex items-baseline gap-3">
                                                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight">
                                                    {currentRate.rate}%
                                                </h1>
                                                <span className="text-2xl md:text-3xl text-white/80 font-medium">
                                                    /an
                                                </span>
                                            </div>
                                            <p className="text-lg md:text-xl text-white/90 mt-2 font-medium">
                                                {t("annualRate")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-sm md:text-base">
                                            {t("effectiveDate")} {formatDateFrench(currentRate.effectiveDate)}
                                        </span>
                                    </div>
                                </div>

                                {/* Description admin */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <p className="text-sm md:text-base text-white/90 leading-relaxed">
                                        <strong>💡 {t("impact")} :</strong> {t("impactText")}
                                    </p>
                                </div>
                            </div>

                            {/* Droite : Statistiques d'impact */}
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                                    {t("clientImpact")}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <ImpactCard
                                        label={t("impactCard.one")}
                                        amount={1000}
                                        rate={currentRate.rate}
                                        t={t}
                                    />
                                    <ImpactCard
                                        label={t("impactCard.ten")}
                                        amount={10000}
                                        rate={currentRate.rate}
                                        highlighted
                                        t={t}
                                    />
                                    <ImpactCard
                                        label={t("impactCard.fifty")}
                                        amount={50000}
                                        rate={currentRate.rate}
                                        t={t}
                                    />
                                </div>

                                {/* CTA Admin */}
                                <div className="flex w-full justify-center">
                                    <Button
                                        size="lg"
                                        className="bg-white text-pink-900 hover:bg-white/90 font-semibold shadow-xl"
                                        onClick={() => router.push("/director/savings-rate/new")}
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        {t("new")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })
        .exhaustive();
}

const ImpactCard = ({
    label,
    amount,
    rate,
    highlighted = false,
    t
}: {
    label: string;
    amount: number;
    rate: number;
    highlighted?: boolean;
    t: ReturnType<typeof useTranslations>;
}) => {
    const yearlyGain = (amount * rate) / 100;
    const monthlyGain = yearlyGain / 12;
    const dailyGain = yearlyGain / 365;

    return (
        <div
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${highlighted
                ? "bg-white/25 border-white/40 scale-105 shadow-lg"
                : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-white/80 font-medium">{label}</p>
                    {highlighted && (
                        <Badge className="bg-yellow-400/20 text-yellow-200 border-yellow-300/30 text-xs">
                            {t("impactCard.popular")}
                        </Badge>
                    )}
                </div>

                {/* Gains */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <p className="text-xs text-white/60">{t("impactCard.annual")}</p>
                        <p className="text-lg font-bold text-white">
                            {yearlyGain.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-white/60">{t("impactCard.monthly")}</p>
                        <p className="text-lg font-bold text-white">
                            {monthlyGain.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-white/60">{t("impactCard.daily")}</p>
                        <p className="text-lg font-bold text-white">
                            {dailyGain.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 2,
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminHeroBannerSkeleton = () => (
    <div className="rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48 rounded-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24 rounded" />
                        <Skeleton className="h-9 w-28 rounded" />
                    </div>
                </div>
                <Skeleton className="h-24 w-64" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Skeleton className="h-12 w-full rounded" />
                    <Skeleton className="h-12 w-full rounded" />
                </div>
            </div>
        </div>
    </div>
);