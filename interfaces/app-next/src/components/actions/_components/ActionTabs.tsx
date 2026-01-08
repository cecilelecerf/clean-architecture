"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Layers,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    LineChart as LineChartIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Action, } from "@infrastructure/types/action";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { MyOrders } from "./MyOrder";
import { ChartTab } from "./ChartTab";
import clsx from "clsx";

export const ActionTabs = ({ action, isAdmin }: { action: Action, isAdmin?: boolean }) => {
    const statsQuery = useQuery(endpoints.actions.getStats({ isin: action.ISIN }));

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className={clsx(`grid w-full mb-4`, isAdmin ? "grid-cols-3" : "grid-cols-4")}>
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    <Activity className="w-4 h-4 mr-1 hidden sm:inline" />
                    Vue d'ensemble
                </TabsTrigger>
                {!isAdmin && (
                    <TabsTrigger value="my-order" className="text-xs sm:text-sm">
                        <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                        Mes actions
                    </TabsTrigger>
                )}
                <TabsTrigger value="chart" className="text-xs sm:text-sm">
                    <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                    Graphiques
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">
                    <BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />
                    Statistiques
                </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MobileInfoCard
                        icon={Building2}
                        label="Marché"
                        value={action.market}
                        color="blue"
                    />
                    <MobileInfoCard
                        icon={Layers}
                        label="Secteur"
                        value={action.activitySector}
                        color="purple"
                    />
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Informations détaillées
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <MobileDetailRow label="ISIN" value={action.ISIN} />
                        <Separator />
                        <MobileDetailRow label="Symbole" value={action.symbol} />
                        <Separator />
                        <MobileDetailRow
                            label="Prix unitaire"
                            value={`${action.price.amount} ${action.price.currency}`}
                        />
                        <Separator />
                        <Separator />
                        <MobileDetailRow
                            label="Créée le"
                            value={formatDateFrench(action.createdAt)}
                        />
                        {action.updatedAt && (
                            <>
                                <Separator />
                                <MobileDetailRow
                                    label="Maj le"
                                    value={formatDateFrench(action.updatedAt)}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            {!isAdmin && (
                <TabsContent value="my-order" className="space-y-4"><MyOrders action={action} /></TabsContent>
            )}
            {/* Chart Tab */}
            <TabsContent value="chart" className="space-y-4">
                <ChartTab action={action} />
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4">
                {match(statsQuery)
                    .with({ status: "pending" }, () => <StatsSkeleton />)
                    .with({ status: "error" }, () => (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500 text-center">
                                    Impossible de charger les statistiques
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: stats }) => (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <PerformanceRow
                                        label="Variation 24h"
                                        value={stats.priceChange24h}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label="Variation 7j"
                                        value={stats.priceChange7d}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label="Variation 30j"
                                        value={stats.priceChange30d}
                                        isPercentage
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard
                                    label="Prix min (30j)"
                                    value={`${stats.minPrice7d} ${action.price.currency}`}
                                    icon={TrendingDown}
                                    color="red"
                                />
                                <StatCard
                                    label="Prix max (30j)"
                                    value={`${stats.maxPrice7d} ${action.price.currency}`}
                                    icon={TrendingUp}
                                    color="green"
                                />
                            </div>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Trading
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <MobileDetailRow
                                        label="Volume total (7j)"
                                        value={stats.totalVolume7d}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label="Prix moyen (7j)"
                                        value={`${stats.averagePrice7d} ${action.price.currency}`}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label="Transactions (7j)"
                                        value={stats.transactionCount7d}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    ))
                    .exhaustive()}
            </TabsContent>
        </Tabs>
    )
}

interface MobileInfoCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "blue" | "green" | "purple";
}

function MobileInfoCard({ icon: Icon, label, value, color }: MobileInfoCardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    return (
        <Card className={`border ${colorClasses[color]}`}>
            <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <p className="text-xs font-medium truncate">{label}</p>
                </div>
                <p className="text-base md:text-lg font-bold truncate">{value}</p>
            </CardContent>
        </Card>
    );
}

function MobileDetailRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className="flex justify-between items-start gap-3">
            <span className="text-xs text-gray-600  shrink-0">{label}</span>
            <span
                className={`text-sm text-right font-medium ${highlight ? "text-blue-600" : "text-gray-900"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}

function PerformanceRow({
    label,
    value,
    isPercentage = false,
}: {
    label: string;
    value: number;
    isPercentage?: boolean;
}) {
    const isPositive = value >= 0;
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="flex items-center gap-1">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                    className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {isPositive ? "+" : ""}
                    {value}
                    {isPercentage && "%"}
                </span>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: "red" | "green";
}) {
    const colorClasses = {
        red: "bg-red-50 text-red-600 border-red-200",
        green: "bg-green-50 text-green-600 border-green-200",
    };

    return (
        <Card className={`border ${colorClasses[color]}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <p className="text-xs font-medium">{label}</p>
                </div>
                <p className="text-sm font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}



function StatsSkeleton() {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}