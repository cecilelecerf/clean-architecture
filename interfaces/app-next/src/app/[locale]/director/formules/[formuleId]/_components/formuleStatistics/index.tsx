"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { FormuleId } from "@infrastructure/types/formule";
import { endpoints } from "@/utils/endpoint";
import {
    TrendingUp,
    CreditCard,
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Percent
} from "lucide-react";
import { match } from "ts-pattern";
import { useTranslations } from "next-intl";
import { StatsSkeleton } from "./StatsSkeleton";
import { StatCard } from "./StatCard";
import { FinancialStatCard } from "./FinancialStatCard";
import { DetailCard } from "./DetailCard";

interface FormuleStatisticsProps {
    formuleId: FormuleId;
}

export const FormuleStatistics = ({ formuleId }: FormuleStatisticsProps) => {
    const query = useQuery(endpoints.formules.stats({ id: formuleId }));
    const t = useTranslations("director.credits.stats");

    return match(query)
        .with({ status: "pending" }, () => <StatsSkeleton />)
        .with({ status: "error" }, () => (
            <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                Une erreur est survenue lors du chargement des statistiques
            </div>
        ))
        .with({ status: "success" }, ({ data: stats }) => {
            const total = stats.totalCreditsCount
            const detailStats = [
                {
                    icon: CheckCircle,
                    label: t("details.accept"),
                    value: query.data.acceptedCreditsCount,
                    total,
                    color: "green" as const
                },
                {
                    icon: XCircle,
                    label: t("details.refuse"),
                    value: query.data.refusedCreditsCount,
                    total,
                    color: "red" as const
                },
                {
                    icon: Clock,
                    label: t("details.waiting"),
                    value: query.data.pendingCreditsCount,
                    total,
                    color: "orange" as const
                }
            ]
            const financialStats = [
                {
                    icon: TrendingUp,
                    label: t("capital"),
                    value: query.data.totalLoanedAmount,
                    color: "blue" as const
                },
                {
                    icon: DollarSign,
                    label: t("interest"),
                    value: query.data.totalInterestEarned,
                    color: "green" as const
                },
                {
                    icon: Percent,
                    label: t("income"),
                    value: query.data.totalInsuranceEarned,
                    color: "purple" as const
                },
                {
                    icon: TrendingUp,
                    label: t("totalIncome"),
                    value: query.data.totalRevenue,
                    color: "orange" as const
                }
            ]
            const overviewStats = [
                {
                    icon: CreditCard,
                    label: t("active"),
                    value: query.data.activeCreditsCount,
                    color: "blue" as const
                },
                {
                    icon: Users,
                    label: t("customer"),
                    value: query.data.totalClients,
                    color: "green" as const
                },
                {
                    icon: CheckCircle,
                    label: t("accept"),
                    value: `${query.data.acceptanceRate}%`,
                    color: "purple" as const
                },
                {
                    icon: Clock,
                    label: t("wait"),
                    value: query.data.pendingCreditsCount,
                    color: "orange" as const
                }
            ]
            return (
                <div className="space-y-6 my-12">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            {t("overview")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {overviewStats.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={stat.value}
                                    color={stat.color}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            {t("finance")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {financialStats.map((stat, index) => (
                                <FinancialStatCard
                                    key={index}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={stat.value}
                                    color={stat.color}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">{t("details.title")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {detailStats.map((stat, index) => (
                                <DetailCard
                                    key={index}
                                    icon={stat.icon}
                                    label={stat.label}
                                    value={stat.value}
                                    total={stat.total}
                                    color={stat.color}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            )
        })
        .exhaustive();
};

