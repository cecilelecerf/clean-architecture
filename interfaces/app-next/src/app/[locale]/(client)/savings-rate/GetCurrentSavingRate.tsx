"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import {
    CheckCircle,
    Calendar,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function SavingsRateHeroBanner() {
    const query = useQuery(endpoints.savingsRates.getCurrent());

    const t = useTranslations("client.savings");

    return match(query)
        .with({ status: "pending" }, () => <HeroBannerSkeleton />)
        .with({ status: "error" }, () => null)
        .with({ status: "success" }, ({ data: currentRate }) => {
            if (!currentRate) return null;

            return (
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-700 via-blue-600 to-indigo-700">
                    {/* Motif de fond animé */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />
                        <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse delay-1000" />
                    </div>

                    {/* Contenu */}
                    <div className="relative p-6 ">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Gauche : Taux principal */}
                            <div className="space-y-6">
                                {/* Badge */}
                                <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm text-base px-4 py-1.5">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {t("badge")}
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
                                                    {t("year")}
                                                </span>
                                            </div>
                                            <p className="text-lg md:text-xl text-white/90 mt-2 font-medium">
                                                {t("interestRate")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-sm md:text-base">
                                            {t("effectiveAt")} {formatDateFrench(currentRate.effectiveDate)}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed">
                                    {t("description")}
                                </p>
                            </div>

                            {/* Droite : Exemples de gains */}
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                                    {t("gain")}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <GainCard amount={1000} rate={currentRate.rate} />
                                    <GainCard amount={10000} rate={currentRate.rate} highlighted />
                                    <GainCard amount={50000} rate={currentRate.rate} />
                                </div>

                                <Link href="/accounts/new?type=epargne">
                                    <Button
                                        size="lg"
                                        className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-xl"
                                    >
                                        {t("open")}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })
        .exhaustive();
}

const GainCard = ({
    amount,
    rate,
    highlighted = false,
}: {
    amount: number;
    rate: number;
    highlighted?: boolean;
}) => {
    const t = useTranslations("client.savings.card");

    const yearlyGain = (amount * rate) / 100;
    const monthlyGain = yearlyGain / 12;

    return (
        <div
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${highlighted
                ? "bg-white/25 border-white/40 scale-105 shadow-lg"
                : "bg-white/10 border-white/20 hover:bg-white/15"
                }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-white/70 font-medium">
                        {t("with")}{" "}
                        {amount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                        })}
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                        +
                        {yearlyGain.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                        })}
                    </p>
                    <p className="text-xs text-white/60">{t("year")}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-white/90">
                        {monthlyGain.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 2,
                        })}
                    </p>
                    <p className="text-xs text-white/60">{t("month")}</p>
                </div>
            </div>
        </div>
    );
};

const HeroBannerSkeleton = () => (
    <div className="rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-6 py-8 md:px-10 md:py-12 lg:px-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-full" />
                <Skeleton className="h-24 w-64" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-20 w-full max-w-xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        </div>
    </div>
);
