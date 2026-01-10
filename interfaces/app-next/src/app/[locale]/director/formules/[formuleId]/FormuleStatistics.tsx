"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

interface FormuleStatisticsProps {
    formuleId: FormuleId;
}

export function FormuleStatistics({ formuleId }: FormuleStatisticsProps) {
    const query = useQuery(endpoints.formules.stats({ id: formuleId }));

    return match(query)
        .with({ status: "pending" }, () => <StatsSkeleton />)
        .with({ status: "error" }, () => ("error"))
        .with({ status: "success" }, ({ data: stats }) => (
            <div className="space-y-6 my-12">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Vue d'ensemble
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={CreditCard}
                            label="Crédits actifs"
                            value={stats.activeCreditsCount}
                            color="blue"
                        />
                        <StatCard
                            icon={Users}
                            label="Clients"
                            value={stats.totalClients}
                            color="green"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Taux d'acceptation"
                            value={`${stats.acceptanceRate}%`}
                            color="purple"
                        />
                        <StatCard
                            icon={Clock}
                            label="En attente"
                            value={stats.pendingCreditsCount}
                            color="orange"
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Statistiques financières
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FinancialStatCard
                            icon={TrendingUp}
                            label="Capital prêté total"
                            value={stats.totalLoanedAmount}
                            color="blue"
                        />
                        <FinancialStatCard
                            icon={DollarSign}
                            label="Intérêts générés"
                            value={stats.totalInterestEarned}
                            color="green"
                        />
                        <FinancialStatCard
                            icon={Percent}
                            label="Revenus assurance"
                            value={stats.totalInsuranceEarned}
                            color="purple"
                        />
                        <FinancialStatCard
                            icon={TrendingUp}
                            label="Revenus totaux"
                            value={stats.totalRevenue}
                            color="orange"
                        />
                    </div>
                </Card>

                {/* Détails des crédits */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Répartition des crédits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailCard
                            icon={CheckCircle}
                            label="Acceptés"
                            value={stats.acceptedCreditsCount}
                            total={stats.totalCreditsCount}
                            color="green"
                        />
                        <DetailCard
                            icon={XCircle}
                            label="Refusés"
                            value={stats.refusedCreditsCount}
                            total={stats.totalCreditsCount}
                            color="red"
                        />
                        <DetailCard
                            icon={Clock}
                            label="En attente"
                            value={stats.pendingCreditsCount}
                            total={stats.totalCreditsCount}
                            color="orange"
                        />
                    </div>
                </Card>
            </div>
        ))
        .exhaustive();
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-50/10",
        green: "bg-green-50 text-green-600 dark:bg-green-50/10",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-50/10",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-50/10",
    };

    const textColorClasses = {
        blue: "text-blue-700",
        green: "text-green-700",
        purple: "text-purple-700",
        orange: "text-orange-700",
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-500/10 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );
}

interface FinancialStatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    color: "blue" | "green" | "purple" | "orange";
}

function FinancialStatCard({ icon: Icon, label, value, color }: FinancialStatCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
        green: "bg-green-50 text-green-600 dark:bg-green-500/10",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10",
    };

    const textColorClasses = {
        blue: "text-blue-700",
        green: "text-green-700",
        purple: "text-purple-700",
        orange: "text-orange-700",
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-500/10 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className={`text-xl font-bold ${textColorClasses[color]}`}>
                {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );
}

interface DetailCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    total: number;
    color: "green" | "red" | "orange";
}

function DetailCard({ icon: Icon, label, value, total, color }: DetailCardProps) {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

    const colorClasses = {
        green: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-200/10",
        red: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-200/10",
        orange: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-200/10",
    };

    const textColorClasses = {
        green: "text-green-700",
        red: "text-red-700",
        orange: "text-orange-700",
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" />
                <span className={`text-sm font-semibold ${textColorClasses[color]}`}>
                    {percentage}%
                </span>
            </div>
            <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
            <p className="text-xs opacity-75 mt-1">{label}</p>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </Card>
            <Card className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </Card>
        </div>
    );
}