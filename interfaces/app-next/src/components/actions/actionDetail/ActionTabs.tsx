"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
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
import { Action, ActionStats } from "@infrastructure/types/action";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { MyOrders } from "./MyOrder";
import { ChartTab } from "./ChartTab";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

interface ActionTabsProps {
    action: Action;
    isAdmin?: boolean;
}

export const ActionTabs = memo(({ action, isAdmin }: ActionTabsProps) => {
    const statsQuery = useQuery(endpoints.actions.getStats({ isin: action.ISIN }));
    const t = useTranslations("director.stocks.details");

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className={clsx("grid w-full mb-4", isAdmin ? "grid-cols-3" : "grid-cols-4")}>
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

            <TabsContent value="overview" className="space-y-4">
                <OverviewTab action={action} t={t} />
            </TabsContent>

            {!isAdmin && (
                <TabsContent value="my-order" className="space-y-4">
                    <MyOrders action={action} />
                </TabsContent>
            )}

            <TabsContent value="chart" className="space-y-4">
                <ChartTab action={action} />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
                <StatsTab statsQuery={statsQuery} action={action} t={t} />
            </TabsContent>
        </Tabs>
    );
});

ActionTabs.displayName = 'ActionTabs';

const OverviewTab = memo(({ action, t }: { action: Action; t: any }) => (
    <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
    </>
));

OverviewTab.displayName = 'OverviewTab';

const StatsTab = memo(({ statsQuery, action, t }: { statsQuery: UseQueryResult<ActionStats, Error>; action: Action; t: any }) => (
    match(statsQuery)
        .with({ status: "pending" }, () => <StatsSkeleton />)
        .with({ status: "error" }, () => (
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        {t("stats.unableLoading")}
                    </p>
                </CardContent>
            </Card>
        ))
        .with({ status: "success" }, ({ data: stats }) => (
            <StatsContent stats={stats} action={action} t={t} />
        ))
        .exhaustive()
));

StatsTab.displayName = 'StatsTab';

const StatsContent = memo(({ stats, action, t }: { stats: any; action: Action; t: any }) => (
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
));

StatsContent.displayName = 'StatsContent';

const MobileInfoCard = memo(({
    icon: Icon,
    label,
    value,
    color
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: "blue" | "green" | "purple";
}) => {
    const colorClasses = useMemo(() => ({
        blue: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-950",
        green: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-950",
        purple: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:border-purple-950",
    }), []);

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
});

MobileInfoCard.displayName = 'MobileInfoCard';

const MobileDetailRow = memo(({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div className="flex justify-between items-start gap-3">
        <span className="text-xs text-gray-600 dark:text-gray-400 shrink-0">{label}</span>
        <span className="text-sm text-right font-medium dark:text-gray-300 text-gray-900">
            {value}
        </span>
    </div>
));

MobileDetailRow.displayName = 'MobileDetailRow';

const PerformanceRow = memo(({
    label,
    value,
    isPercentage = false,
}: {
    label: string;
    value: number;
    isPercentage?: boolean;
}) => {
    const isPositive = value >= 0;
    const formattedValue = useMemo(() => {
        return `${isPositive ? "+" : ""}${value}${isPercentage ? "%" : ""}`;
    }, [value, isPositive, isPercentage]);

    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <div className="flex items-center gap-1">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-semibold ${isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                    }`}>
                    {formattedValue}
                </span>
            </div>
        </div>
    );
});

PerformanceRow.displayName = 'PerformanceRow';

const StatCard = memo(({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: "red" | "green";
}) => {
    const colorClasses = useMemo(() => ({
        red: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-800",
        green: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-800",
    }), []);

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
});

StatCard.displayName = 'StatCard';

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
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
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