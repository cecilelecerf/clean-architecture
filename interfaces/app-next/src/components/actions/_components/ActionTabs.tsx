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
import { useTranslations } from "next-intl";

export const ActionTabs = ({ action, isAdmin }: { action: Action, isAdmin?: boolean }) => {
    const statsQuery = useQuery(endpoints.actions.getStats({ isin: action.ISIN }));
    const t = useTranslations("director.stocks.details");

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className={clsx(`grid w-full mb-4`, isAdmin ? "grid-cols-3" : "grid-cols-4")}>
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    <Activity className="w-4 h-4 mr-1 hidden sm:inline" />
                    {t("tabs.overview")}
                </TabsTrigger>
                {!isAdmin && (
                    <TabsTrigger value="my-order" className="text-xs sm:text-sm">
                        <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                        {t("tabs.mine")}
                    </TabsTrigger>
                )}
                <TabsTrigger value="chart" className="text-xs sm:text-sm">
                    <LineChartIcon className="w-4 h-4 mr-1 hidden sm:inline" />
                    {t("tabs.graph")}
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs sm:text-sm">
                    <BarChart3 className="w-4 h-4 mr-1 hidden sm:inline" />
                    {t("tabs.stats")}
                </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MobileInfoCard
                        icon={Building2}
                        label={t("overview.market")}
                        value={action.market}
                        color="blue"
                    />
                    <MobileInfoCard
                        icon={Layers}
                        label={t("overview.sector")}
                        value={action.activitySector}
                        color="purple"
                    />
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            {t("overview.title")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <MobileDetailRow label="ISIN" value={action.ISIN} />
                        <Separator />
                        <MobileDetailRow label={t("overview.symbol")} value={action.symbol} />
                        <Separator />
                        <MobileDetailRow
                            label={t("overview.price")}
                            value={`${action.price.amount} ${action.price.currency}`}
                        />
                        <Separator />
                        <Separator />
                        <MobileDetailRow
                            label={t("overview.createdAt")}
                            value={formatDateFrench(action.createdAt)}
                        />
                        {action.updatedAt && (
                            <>
                                <Separator />
                                <MobileDetailRow
                                    label={t("overview.updatedAt")}
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
                                    {t("stats.unableLoading")}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                    .with({ status: "success" }, ({ data: stats }) => (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {t("stats.perf")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <PerformanceRow
                                        label={t("stats.variation.24")}
                                        value={stats.priceChange24h}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label={t("stats.variation.7")}
                                        value={stats.priceChange7d}
                                        isPercentage
                                    />
                                    <Separator />
                                    <PerformanceRow
                                        label={t("stats.variation.30")}
                                        value={stats.priceChange30d}
                                        isPercentage
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard
                                    label={t("stats.minPrice")}
                                    value={`${stats.minPrice7d} ${action.price.currency}`}
                                    icon={TrendingDown}
                                    color="red"
                                />
                                <StatCard
                                    label={t("stats.maxPrice")}
                                    value={`${stats.maxPrice7d} ${action.price.currency}`}
                                    icon={TrendingUp}
                                    color="green"
                                />
                            </div>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        {t("stats.trade")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <MobileDetailRow
                                        label={t("stats.totalVolume")}
                                        value={stats.totalVolume7d}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label={t("stats.averagePrice")}
                                        value={`${stats.averagePrice7d} ${action.price.currency}`}
                                    />
                                    <Separator />
                                    <MobileDetailRow
                                        label={t("stats.transactions")}
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